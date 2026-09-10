"use client";

import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { NAMES_99 } from "@/lib/data/names99";
import { Card, PageHeader } from "@/components/ui";

export default function NamesPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].names;

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Allah header */}
      <Card className="atmo girih-bg mb-5 overflow-hidden border-border-strong py-8 text-center">
        <p className="arabic text-5xl text-gilded" style={{ direction: "rtl" }}>ٱللَّٰه</p>
        <p className={`mt-2 text-sm text-white/70 ${bn}`}>{tx.subtitle}</p>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {NAMES_99.map((n) => (
          <Card key={n.n} className="flex items-center gap-4 p-4 transition-colors hover:border-gold/40">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center">
              <svg viewBox="0 0 44 44" className="absolute inset-0 text-gold/25">
                <circle cx="22" cy="22" r="20" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="font-display text-sm font-semibold text-gold">{n.n}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text">{n.tr}</p>
              <p className={`truncate text-xs text-muted ${bn}`}>{lang === "en" ? n.en : n.bn}</p>
            </div>
            <span className="arabic text-2xl text-text-soft" style={{ direction: "rtl" }}>{n.ar}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
