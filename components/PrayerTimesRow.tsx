"use client";

import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { to12h, type PrayerKey } from "@/lib/prayer-utils";
import type { Timings } from "@/lib/aladhan";
import Icon, { type IconName } from "./Icon";

const ROW: { key: PrayerKey; icon: IconName }[] = [
  { key: "Fajr", icon: "moon" },
  { key: "Sunrise", icon: "sun" },
  { key: "Dhuhr", icon: "sun" },
  { key: "Asr", icon: "sun" },
  { key: "Maghrib", icon: "moon" },
  { key: "Isha", icon: "moon" },
];

export default function PrayerTimesRow({
  timings,
  nextKey,
  variant = "row",
}: {
  timings: Timings;
  nextKey?: PrayerKey;
  variant?: "row" | "list";
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].prayer;

  if (variant === "list") {
    return (
      <div className="divide-y divide-border overflow-hidden rounded-[var(--radius-card)] border border-border bg-card">
        {ROW.map(({ key, icon }) => {
          const v = to12h(timings[key]);
          const active = key === nextKey;
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${active ? "bg-gold/10" : ""}`}
            >
              <span className={`grid h-9 w-9 place-items-center rounded-full ${active ? "bg-gold text-on-gold" : "bg-surface text-muted"}`}>
                <Icon name={icon} size={18} />
              </span>
              <span className={`font-medium ${active ? "text-gold" : "text-text"} ${bn}`}>
                {tx[key.toLowerCase() as keyof typeof tx]}
              </span>
              {active && (
                <span className={`ml-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold ${bn}`}>
                  {tx.next}
                </span>
              )}
              <span className="ml-auto tabular-nums">
                <span className={`font-semibold ${active ? "text-gold" : "text-text"}`}>{v.time}</span>
                <span className="ml-1 text-xs text-muted">{v.meridiem}</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {ROW.map(({ key }) => {
        const v = to12h(timings[key]);
        const active = key === nextKey;
        return (
          <div
            key={key}
            className={`rounded-2xl border p-3 text-center transition-colors ${
              active ? "border-gold/50 bg-gold/10" : "border-border bg-card"
            }`}
          >
            <p className={`text-[11px] font-medium ${active ? "text-gold" : "text-muted"} ${bn}`}>
              {tx[key.toLowerCase() as keyof typeof tx]}
            </p>
            <p className={`mt-1 font-display text-lg font-semibold tabular-nums ${active ? "text-gold" : "text-text"}`}>
              {v.time}
            </p>
            <p className="text-[10px] text-muted">{v.meridiem}</p>
          </div>
        );
      })}
    </div>
  );
}
