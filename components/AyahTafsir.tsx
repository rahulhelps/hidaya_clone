"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { getTafsir } from "@/lib/quran";
import Icon from "./Icon";
import { Spinner } from "./ui";

export default function AyahTafsir({
  verseKey,
  premium,
  onUpsell,
}: {
  verseKey: string;
  premium: boolean;
  onUpsell: () => void;
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].tafsir;
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset cached text when the language changes so we refetch in the new one.
  useEffect(() => {
    setText(null);
  }, [lang]);

  useEffect(() => {
    if (!open || !premium || text !== null) return;
    setLoading(true);
    getTafsir(verseKey, lang)
      .then(setText)
      .catch(() => setText(""))
      .finally(() => setLoading(false));
  }, [open, premium, text, verseKey, lang]);

  const toggle = () => {
    if (!premium) {
      onUpsell();
      return;
    }
    setOpen((o) => !o);
  };

  return (
    <div className="mt-4 border-t border-border pt-3">
      <button
        onClick={toggle}
        className={`flex items-center gap-1.5 text-xs font-semibold text-gold ${bn}`}
        aria-expanded={open}
      >
        {!premium && <Icon name="lock" size={13} />}
        <Icon name="scroll" size={14} />
        {open ? tx.hide : tx.show}
        {premium && (
          <Icon name="chevron-down" size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>

      {open && premium && (
        <div className="fade-up mt-3">
          {loading ? (
            <p className={`flex items-center gap-2 text-sm text-muted ${bn}`}>
              <Spinner className="h-4 w-4" /> {tx.loading}
            </p>
          ) : (
            <p className={`whitespace-pre-line text-sm leading-relaxed text-text-soft ${bn}`}>{text}</p>
          )}
        </div>
      )}
    </div>
  );
}
