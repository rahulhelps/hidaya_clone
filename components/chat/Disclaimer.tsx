"use client";

// The fatwa disclaimer. Dismissible per session rather than permanently: it is
// the kind of thing a user should be reminded of each time they come back.

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";

const KEY = "hidayah_chat_disclaimer_ack";

export default function Disclaimer({ text }: { text?: string }) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode */
    }
  };

  if (dismissed) return null;

  return (
    <div className="rounded-2xl border border-border bg-card-hi px-4 py-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0 text-gold">
          <Icon name="sparkle" size={16} />
        </span>
        <div className="min-w-0">
          <p className={`text-xs leading-relaxed text-text-soft ${bn}`}>
            {/* Server-supplied when available, so wording can change without a redeploy. */}
            {text || tx.disclaimer}
          </p>
          <button
            type="button"
            onClick={dismiss}
            className={`mt-2 text-xs font-medium text-gold ${bn}`}
          >
            {tx.disclaimerOk}
          </button>
        </div>
      </div>
    </div>
  );
}
