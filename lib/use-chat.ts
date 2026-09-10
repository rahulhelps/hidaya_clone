"use client";

// The chat state machine: load a thread, send a turn, abort, retry, track quota.
// Kept out of lib/api.ts so transport stays separate from state.
//
// Phase 1 is buffered - one request that resolves after 5-25s. When SSE lands,
// only `deliver` below changes; every component keeps its current props.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type ChatMessage,
  type ChatModel,
  type ChatQuota,
  deleteConversation,
  getChatModels,
  getChatQuota,
  getConversation,
  sendChatMessage,
} from "@/lib/api";

export type ErrorKind = "cap" | "busy" | "timeout" | "inflight" | "offline" | "generic";
export type ChatError = { kind: ErrorKind; retryable: boolean } | null;
export type Pending = { text: string; startedAt: number } | null;

/** Client-side ceiling. Longer than the server's 55s budget so the server's
 *  own 504 wins and the user gets a specific message rather than a generic one. */
const CLIENT_TIMEOUT_MS = 65_000;
const LOCAL_PREFIX = "local-";

function statusToKind(status?: number): ErrorKind {
  if (status === 429) return "cap";
  if (status === 503) return "busy";
  if (status === 504) return "timeout";
  if (status === 409) return "inflight";
  return "generic";
}

function draftKey(id: string | null) {
  return `hidayah_chat_draft:${id ?? "new"}`;
}

export function useChat(initialConversationId: string | null) {
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [title, setTitle] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<ChatError>(null);
  const [quota, setQuota] = useState<ChatQuota | null>(null);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [modelId, setModelId] = useState("");
  const [loading, setLoading] = useState(Boolean(initialConversationId));
  const [loadFailed, setLoadFailed] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const lastSentRef = useRef("");
  // Set when send() should hand text back to the composer (cancel / edit).
  const [restored, setRestored] = useState<string | null>(null);

  // ── Bootstrap: models + quota, then the thread if we have one ──
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await getChatModels();
        if (cancelled) return;
        setModels(list.models);
        setModelId((current) => current || list.defaultModelId);
      } catch {
        /* the picker just stays empty; sending still works with the default */
      }
      try {
        const q = await getChatQuota();
        if (!cancelled) setQuota(q);
      } catch {
        /* quota chip stays hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initialConversationId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getConversation(initialConversationId)
      .then((thread) => {
        if (cancelled) return;
        setTitle(thread.title);
        setMessages(thread.messages);
        if (thread.modelId) setModelId(thread.modelId);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialConversationId]);

  const refreshQuota = useCallback(async () => {
    try {
      setQuota(await getChatQuota());
    } catch {
      /* leave the last known value */
    }
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;
      if (quota && quota.remaining <= 0) {
        setError({ kind: "cap", retryable: false });
        return;
      }
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setError({ kind: "offline", retryable: true });
        return;
      }

      setError(null);
      lastSentRef.current = text;

      // Optimistic user bubble, reconciled away on success.
      const localId = `${LOCAL_PREFIX}${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: localId,
          role: "user",
          content: text,
          modelId: null,
          createdAt: new Date().toISOString(),
          error: null,
        },
      ]);
      setPending({ text, startedAt: Date.now() });

      const controller = new AbortController();
      abortRef.current = controller;
      const signal =
        typeof AbortSignal.any === "function"
          ? AbortSignal.any([controller.signal, AbortSignal.timeout(CLIENT_TIMEOUT_MS)])
          : controller.signal;

      try {
        const result = await sendChatMessage({ conversationId, content: text, modelId }, signal);

        setMessages((prev) => [
          ...prev.filter((m) => !m.id.startsWith(LOCAL_PREFIX)),
          result.userMessage,
          result.assistantMessage,
        ]);
        setTitle(result.title);
        setQuota((prev) => (prev ? { ...prev, ...result.quota } : prev));

        if (!conversationId) {
          setConversationId(result.conversationId);
          // replaceState (not router.replace) so the component is not remounted
          // and the reply that just arrived stays on screen.
          window.history.replaceState(null, "", `/chat/${result.conversationId}`);
        }
        try {
          sessionStorage.removeItem(draftKey(conversationId));
        } catch {
          /* private mode */
        }
      } catch (err) {
        const failure = err as Error & { status?: number };
        const aborted = failure.name === "AbortError" || failure.name === "TimeoutError";
        const byUser = aborted && controller.signal.aborted;

        setMessages((prev) => prev.filter((m) => !m.id.startsWith(LOCAL_PREFIX)));

        if (byUser) {
          setRestored(text);
        } else if (aborted) {
          setError({ kind: "timeout", retryable: true });
        } else {
          const kind = statusToKind(failure.status);
          setError({ kind, retryable: kind !== "cap" });
          if (kind === "cap") {
            setQuota((prev) => (prev ? { ...prev, remaining: 0, used: prev.limit } : prev));
          }
          if (kind === "inflight" && conversationId) {
            // Another tab's request may have landed; pick it up.
            void getConversation(conversationId)
              .then((thread) => setMessages(thread.messages))
              .catch(() => {});
          }
          // Whether a failure consumed a message is the server's call, so
          // re-read rather than guessing.
          if (kind !== "cap") void refreshQuota();
        }
      } finally {
        abortRef.current = null;
        setPending(null);
      }
    },
    [conversationId, modelId, pending, quota, refreshQuota]
  );

  const abort = useCallback(() => abortRef.current?.abort(), []);

  const retry = useCallback(() => {
    if (lastSentRef.current) void send(lastSentRef.current);
  }, [send]);

  const editLast = useCallback(() => {
    setError(null);
    setRestored(lastSentRef.current);
  }, []);

  /** Consume a restored draft exactly once (cancel / edit hand text back). */
  const takeRestored = useCallback(() => {
    setRestored(null);
    return restored;
  }, [restored]);

  const remove = useCallback(async (id: string) => {
    await deleteConversation(id);
  }, []);

  return {
    conversationId,
    title,
    messages,
    pending,
    error,
    quota,
    models,
    modelId,
    loading,
    loadFailed,
    restored,
    setModelId,
    send,
    abort,
    retry,
    editLast,
    takeRestored,
    refreshQuota,
    remove,
    draftKey,
  };
}
