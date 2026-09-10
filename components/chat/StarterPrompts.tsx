"use client";

import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";

export default function StarterPrompts({ onPick }: { onPick: (text: string) => void }) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";

  return (
    <div className="py-6">
      <div className="mb-5 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-border-strong bg-card text-gold">
          <Icon name="chat" size={24} />
        </span>
        <h2 className={`font-display text-lg font-semibold text-text ${bn}`}>{tx.emptyTitle}</h2>
        <p className={`mt-1 text-sm text-text-soft ${bn}`}>{tx.emptyHint}</p>
      </div>

      <div className="stagger grid gap-2 sm:grid-cols-2">
        {tx.suggest.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className={`fade-up rounded-2xl border border-border bg-card px-4 py-3 text-left text-sm leading-relaxed text-text-soft transition hover:border-gold/40 hover:text-text ${bn}`}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
