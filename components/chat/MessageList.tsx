"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import type { ChatMessage } from "@/lib/api";
import t from "@/lib/translations";
import type { ChatError, Pending } from "@/lib/use-chat";
import MessageBubble from "./MessageBubble";
import PendingBubble from "./PendingBubble";

export default function MessageList({
  messages,
  pending,
  error,
  onStop,
  onRetry,
  onEdit,
  onChangeModel,
  onAnnounce,
  children,
}: {
  messages: ChatMessage[];
  pending: Pending;
  error: ChatError;
  onStop: () => void;
  onRetry: () => void;
  onEdit: () => void;
  onChangeModel: () => void;
  onAnnounce: (text: string) => void;
  children?: React.ReactNode;
}) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const firstPaintRef = useRef(true);
  const prevCountRef = useRef(0);
  const [showJump, setShowJump] = useState(false);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
    if (stickRef.current) setShowJump(false);
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!stickRef.current) {
      if (messages.length > prevCountRef.current) setShowJump(true);
      prevCountRef.current = messages.length;
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The CSS `scroll-behavior` rule only targets <html>, so pass it here.
    // Loading a long thread jumps instantly rather than animating.
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduced || firstPaintRef.current ? "auto" : "smooth",
    });
    firstPaintRef.current = false;
    prevCountRef.current = messages.length;
  }, [messages, pending]);

  useEffect(() => {
    if (messages.length) firstPaintRef.current = false;
  }, [messages.length]);

  const jump = () => {
    const el = scrollRef.current;
    if (!el) return;
    stickRef.current = true;
    setShowJump(false);
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const errorText = error
    ? {
        cap: tx.quotaExhausted,
        busy: tx.errBusy,
        timeout: tx.errTimeout,
        inflight: tx.errInFlight,
        offline: tx.errOffline,
        generic: tx.errGeneric,
      }[error.kind]
    : "";

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label={tx.title}
        aria-live="off"
        aria-busy={Boolean(pending)}
        className="h-full space-y-4 overflow-y-auto overscroll-contain px-4 pb-4 pt-4 sm:px-0"
      >
        {children}

        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isNew={index >= prevCountRef.current - 2}
            onAnnounce={onAnnounce}
          />
        ))}

        {pending && <PendingBubble startedAt={pending.startedAt} onStop={onStop} />}

        {error && (
          <div
            className={`rounded-2xl border border-gold/40 bg-card px-4 py-3 text-sm text-text-soft ${bn}`}
          >
            <p className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-gold">
                <Icon name="x" size={15} />
              </span>
              <span>{errorText}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {/* No retry on a hard cap - a retry button there would be a lie. */}
              {error.retryable && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-text transition hover:border-gold/50 ${bn}`}
                >
                  {tx.retry}
                </button>
              )}
              {error.kind === "busy" && (
                <button
                  type="button"
                  onClick={onChangeModel}
                  className={`rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-text transition hover:border-gold/50 ${bn}`}
                >
                  {tx.changeModel}
                </button>
              )}
              <button
                type="button"
                onClick={onEdit}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium text-muted transition hover:text-text ${bn}`}
              >
                {tx.edit}
              </button>
            </div>
          </div>
        )}
      </div>

      {showJump && (
        <button
          type="button"
          onClick={jump}
          className={`absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text shadow-lg transition hover:border-gold/50 ${bn}`}
        >
          <Icon name="arrow-down" size={14} />
          {tx.jumpToLatest}
        </button>
      )}
    </div>
  );
}
