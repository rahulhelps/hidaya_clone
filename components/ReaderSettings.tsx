"use client";

import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { RECITERS, TRANSLATION_OPTIONS } from "@/lib/quran";
import type { ArabicSize, ReaderPrefs } from "@/lib/reader-prefs";
import Icon from "./Icon";
import { Segmented, Sheet } from "./ui";
import { UnlockChip } from "./PremiumGate";

export default function ReaderSettings({
  open,
  onClose,
  prefs,
  onChange,
  premium,
}: {
  open: boolean;
  onClose: () => void;
  prefs: ReaderPrefs;
  onChange: (p: ReaderPrefs) => void;
  premium: boolean;
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].reader;
  const options = TRANSLATION_OPTIONS[lang];

  const toggleTranslation = (id: number) => {
    const has = prefs.translationIds.includes(id);
    const next = has
      ? prefs.translationIds.filter((x) => x !== id)
      : [...prefs.translationIds, id];
    onChange({ ...prefs, translationIds: next });
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className={`font-display text-lg font-semibold ${bn}`}>{tx.settings}</h2>
          <button onClick={onClose} className="text-muted hover:text-text" aria-label="Close">
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Arabic size - free */}
        <div className="mb-6">
          <p className={`mb-2 text-sm font-medium text-text-soft ${bn}`}>{tx.arabicSize}</p>
          <Segmented<ArabicSize>
            value={prefs.arabicSize}
            onChange={(v) => onChange({ ...prefs, arabicSize: v })}
            options={[
              { value: "sm", label: tx.sizeSmall },
              { value: "md", label: tx.sizeMedium },
              { value: "lg", label: tx.sizeLarge },
            ]}
          />
        </div>

        {!premium && (
          <div className={`mb-5 flex items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-3.5 ${bn}`}>
            <p className="text-xs text-text-soft">{tx.premiumHint}</p>
            <UnlockChip />
          </div>
        )}

        {/* Translations - premium */}
        <div className={`mb-6 ${premium ? "" : "pointer-events-none opacity-50"}`}>
          <p className={`mb-2 text-sm font-medium text-text-soft ${bn}`}>{tx.translations}</p>
          <div className="space-y-1.5">
            {options.map((o) => {
              const checked = premium && prefs.translationIds.includes(o.id);
              const isDefault = !premium && o.id === options[0].id;
              return (
                <button
                  key={o.id}
                  onClick={() => toggleTranslation(o.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left transition-colors hover:bg-card-hi"
                >
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                      checked || isDefault ? "border-gold bg-gold text-on-gold" : "border-border-strong"
                    }`}
                  >
                    {(checked || isDefault) && <Icon name="check" size={13} />}
                  </span>
                  <span className="text-sm text-text">{o.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transliteration - premium */}
        <button
          disabled={!premium}
          onClick={() => onChange({ ...prefs, transliteration: !prefs.transliteration })}
          className={`mb-6 flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 ${premium ? "" : "opacity-50"}`}
        >
          <span className={`text-sm font-medium text-text ${bn}`}>{tx.transliteration}</span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${prefs.transliteration && premium ? "bg-gold" : "bg-border-strong"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-card transition-transform ${prefs.transliteration && premium ? "translate-x-[22px]" : "translate-x-0.5"}`}
            />
          </span>
        </button>

        {/* Reciter - premium */}
        <div className={premium ? "" : "pointer-events-none opacity-50"}>
          <p className={`mb-2 text-sm font-medium text-text-soft ${bn}`}>{tx.reciter}</p>
          <div className="space-y-1.5">
            {RECITERS.map((r) => {
              const active = premium && prefs.reciterId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onChange({ ...prefs, reciterId: r.id })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                    active ? "border-gold/50 bg-gold/10" : "border-border bg-card hover:bg-card-hi"
                  }`}
                >
                  <Icon name="play" size={15} className={active ? "text-gold" : "text-muted"} />
                  <span className={`text-sm ${active ? "text-gold" : "text-text"}`}>{r.name}</span>
                  {active && <Icon name="check" size={16} className="ml-auto text-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
