"use client";

// The waiting state for a buffered reply. Free models take 5-25s, so this is
// the most important piece of UX in the feature: progressive disclosure is
// what stops a 22-second wait reading as a broken app.

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import { localeDigits } from "@/lib/hijri";
import t from "@/lib/translations";

const ELAPSED_AFTER_MS = 4000;
const REASSURE_AFTER_MS = 12000;

export default function PendingBubble({
  startedAt,
  onStop,
}: {
  startedAt: number;
  onStop: () => void;
}) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = () => setElapsed(Date.now() - startedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const seconds = Math.floor(elapsed / 1000);

  return (
    // Same geometry as a real assistant bubble, so nothing jumps when the
    // reply replaces it.
    <div className="flex flex-col items-start gap-1">
      <div className="max-w-[92%] rounded-[1.25rem] rounded-bl-md border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1" aria-hidden>
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gold" />
          </span>
          {/* The label, not the dots, is the real affordance: reduced-motion
              freezes the animation. */}
          <span className={`text-sm text-text-soft ${bn}`}>{tx.thinking}</span>
          {elapsed >= ELAPSED_AFTER_MS && (
            <span className={`text-xs text-muted ${bn}`}>
              {localeDigits(seconds, lang)}
              {lang === "bn" ? ` ${tx.secondsShort}` : tx.secondsShort}
            </span>
          )}
          <button
            type="button"
            onClick={onStop}
            aria-label={tx.stop}
            className="ml-1 rounded-lg p-1 text-muted transition hover:text-text"
          >
            <Icon name="stop" size={14} />
          </button>
        </div>

        {elapsed >= REASSURE_AFTER_MS && (
          <p className={`mt-2 text-xs leading-relaxed text-muted ${bn}`}>{tx.stillThinking}</p>
        )}
      </div>
    </div>
  );
}
