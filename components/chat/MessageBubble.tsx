"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import type { ChatMessage } from "@/lib/api";
import t from "@/lib/translations";
import Markdown from "./Markdown";

export default function MessageBubble({
  message,
  isNew,
  onAnnounce,
}: {
  message: ChatMessage;
  isNew?: boolean;
  onAnnounce?: (text: string) => void;
}) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    if (!navigator.clipboard || !window.isSecureContext) {
      onAnnounce?.(tx.copyFailed);
      return;
    }
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onAnnounce?.(tx.copied);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      onAnnounce?.(tx.copyFailed);
    }
  };

  // Only newly appended messages animate; loading a long thread should not
  // fire forty animations at once.
  const enter = isNew ? "fade-up" : "";

  if (isUser) {
    return (
      <div className={`flex justify-end ${enter}`}>
        <div
          className={`max-w-[85%] rounded-[1.25rem] rounded-br-md bg-card-hi px-4 py-2.5 text-[15px] leading-relaxed text-text ${bn}`}
        >
          <span className="sr-only">{tx.you}: </span>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex flex-col items-start gap-1 ${enter}`}>
      <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md border border-border bg-card px-4 py-3 text-text">
        <span className="sr-only">{tx.assistant}: </span>
        <Markdown>{message.content}</Markdown>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? tx.copied : tx.copy}
        className="ml-1 rounded-lg p-1.5 text-muted opacity-0 transition hover:text-text focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
      >
        <Icon name={copied ? "check" : "copy"} size={15} />
      </button>
    </div>
  );
}
