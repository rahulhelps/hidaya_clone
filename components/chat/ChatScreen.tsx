"use client";

// The whole chat surface. Both /chat and /chat/[id] render this; the only
// difference is whether they pass an id, so starting a thread never remounts
// (see the replaceState in lib/use-chat.ts).

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { ErrorState, Skeleton } from "@/components/ui";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { useChat } from "@/lib/use-chat";
import Composer from "./Composer";
import Disclaimer from "./Disclaimer";
import HistoryDrawer from "./HistoryDrawer";
import MessageList from "./MessageList";
import ModelPicker from "./ModelPicker";
import StarterPrompts from "./StarterPrompts";

export default function ChatScreen({ conversationId }: { conversationId: string | null }) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";
  const router = useRouter();

  const chat = useChat(conversationId);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [modelsOpen, setModelsOpen] = useState(false);
  // One shared live region: short status strings only. Announcing a 400-word
  // reply verbatim would be hostile, so the transcript itself is aria-live="off".
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((text: string) => {
    setAnnouncement(text);
    setTimeout(() => setAnnouncement(""), 2000);
  }, []);

  const send = useCallback(
    (text: string) => {
      announce(tx.thinking);
      void chat.send(text).then(() => announce(tx.replyReady));
    },
    [announce, chat, tx.replyReady, tx.thinking]
  );

  const onDeleted = useCallback(
    (id: string) => {
      if (id === chat.conversationId) router.push("/chat");
    },
    [chat.conversationId, router]
  );

  const activeModel = chat.models.find((m) => m.id === chat.modelId);
  const empty = !chat.loading && chat.messages.length === 0 && !chat.pending;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5 sm:px-0">
        <div className="min-w-0 flex-1">
          <h1 className={`truncate font-display text-base font-semibold text-text ${bn}`}>
            {chat.title || tx.title}
          </h1>
          <button
            type="button"
            onClick={() => setModelsOpen(true)}
            className={`mt-0.5 flex items-center gap-1 text-[11px] text-muted transition hover:text-text ${bn}`}
          >
            {activeModel?.label ?? tx.model}
            <Icon name="chevron-down" size={12} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          aria-label={tx.history}
          className="rounded-xl p-2 text-muted transition hover:text-text"
        >
          <Icon name="scroll" size={19} />
        </button>
        <button
          type="button"
          onClick={() => router.push("/chat")}
          aria-label={tx.newChat}
          className="rounded-xl p-2 text-muted transition hover:text-text"
        >
          <Icon name="plus" size={19} />
        </button>
      </header>

      {chat.loadFailed ? (
        <div className="flex-1 px-4 pt-8 sm:px-0">
          <ErrorState message={tx.loadFailed} onRetry={() => router.refresh()} />
        </div>
      ) : chat.loading ? (
        <div className="flex-1 space-y-3 px-4 pt-6 sm:px-0">
          <Skeleton className="h-12 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-16 w-3/4 rounded-2xl" />
          <Skeleton className="h-24 w-5/6 rounded-2xl" />
        </div>
      ) : (
        <MessageList
          messages={chat.messages}
          pending={chat.pending}
          error={chat.error}
          onStop={chat.abort}
          onRetry={chat.retry}
          onEdit={chat.editLast}
          onChangeModel={() => setModelsOpen(true)}
          onAnnounce={announce}
        >
          <div className="space-y-4">
            <Disclaimer />
            {empty && <StarterPrompts onPick={send} />}
          </div>
        </MessageList>
      )}

      <Composer
        disabled={chat.loading || chat.loadFailed}
        pending={Boolean(chat.pending)}
        quota={chat.quota}
        restored={chat.restored}
        takeRestored={chat.takeRestored}
        draftKey={chat.draftKey(chat.conversationId)}
        onSend={send}
        onStop={chat.abort}
      />

      <ModelPicker
        open={modelsOpen}
        onClose={() => setModelsOpen(false)}
        models={chat.models}
        modelId={chat.modelId}
        onSelect={chat.setModelId}
      />
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        currentId={chat.conversationId}
        onDeleted={onDeleted}
      />

      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
