"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { DUAS, DUA_CATEGORIES } from "@/lib/data/duas";
import Icon, { type IconName } from "@/components/Icon";
import { Card, PageHeader } from "@/components/ui";

const CAT_ICON: Record<string, IconName> = {
  sun: "sun",
  home: "home",
  moon: "moon",
  heart: "heart",
};

export default function DuasPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].duas;
  const [cat, setCat] = useState<string>(DUA_CATEGORIES[0].id);

  const duas = DUAS.filter((d) => d.category === cat);

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Category tabs */}
      <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {DUA_CATEGORIES.map((c) => {
          const active = c.id === cat;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active ? "border-gold bg-gold text-on-gold" : "border-border bg-card text-text-soft hover:bg-card-hi"
              } ${bn}`}
            >
              <Icon name={CAT_ICON[c.icon] ?? "star"} size={16} />
              {lang === "en" ? c.titleEn : c.titleBn}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {duas.map((d) => (
          <Card key={d.id} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className={`font-medium text-text ${bn}`}>{lang === "en" ? d.titleEn : d.titleBn}</h3>
              <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-muted">{d.ref}</span>
            </div>
            <div className="px-5 py-5">
              <p className="arabic text-2xl leading-loose text-text" style={{ direction: "rtl" }}>{d.ar}</p>
              <p className="mt-3 text-sm italic text-gold-soft">{d.tr}</p>
              <p className={`mt-2 text-sm leading-relaxed text-text-soft ${bn}`}>{lang === "en" ? d.en : d.bn}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
