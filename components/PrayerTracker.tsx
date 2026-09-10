"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import {
  FARD,
  cycleStatus,
  getDay,
  currentStreak,
  countLogged,
  heatmap,
  onChange,
  type Status,
  type Fard,
} from "@/lib/prayer-log";
import { usePremiumStatus, PremiumModal } from "@/components/PremiumGate";
import Icon from "./Icon";
import { Button, Card, useMounted } from "./ui";

const STATUS_CLS: Record<Status, string> = {
  none: "border border-border bg-surface text-muted",
  ontime: "bg-jade text-on-gold border border-transparent",
  late: "bg-gold text-on-gold border border-transparent",
  qada: "border border-gold/50 bg-transparent text-gold",
};

function heatCls(ratio: number): string {
  if (ratio === 0) return "bg-border/40";
  if (ratio < 0.5) return "bg-gold/25";
  if (ratio < 1) return "bg-gold/55";
  return "bg-gold";
}

export default function PrayerTracker() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].tracker;
  const tp = t[lang].prayer;
  const premium = usePremiumStatus();
  const mounted = useMounted();
  const [, tick] = useState(0);
  const [upsell, setUpsell] = useState(false);

  useEffect(() => onChange(() => tick((n) => n + 1)), []);

  const statusLabel: Record<Status, string> = {
    none: tx.statusNone,
    ontime: tx.statusOntime,
    late: tx.statusLate,
    qada: tx.statusQada,
  };

  if (!premium) {
    return (
      <Card className="overflow-hidden">
        <div className="atmo girih-bg px-6 py-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-card text-gold">
            <Icon name="check" size={26} />
          </div>
          <h3 className={`font-display text-xl font-semibold text-white ${bn}`}>{tx.premiumTitle}</h3>
          <p className={`mx-auto mt-2 max-w-xs text-sm text-white/70 ${bn}`}>{tx.premiumBody}</p>
          <Button className="mt-5 px-6 py-3" onClick={() => setUpsell(true)}>
            <Icon name="star" size={18} />
            <span className={bn}>{t[lang].account.subscribe}</span>
          </Button>
        </div>
        <PremiumModal open={upsell} onClose={() => setUpsell(false)} />
      </Card>
    );
  }

  const today = mounted ? getDay() : {};
  const streak = mounted ? currentStreak() : 0;
  const week = mounted ? countLogged(7) : { logged: 0, total: 35 };
  const cells = mounted ? heatmap(35) : [];

  return (
    <Card className="overflow-hidden">
      {/* Streak header */}
      <div className="atmo girih-bg flex items-center justify-between px-5 py-5">
        <div>
          <p className={`text-xs uppercase tracking-wider text-white/60 ${bn}`}>{tx.streak}</p>
          <p className="font-display text-4xl font-semibold text-gilded">{streak}</p>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-black/20">
          <span className="text-3xl">🔥</span>
        </div>
      </div>

      {/* Today's prayers */}
      <div className="px-5 py-5">
        <p className={`mb-3 text-xs text-muted ${bn}`}>{tx.tapHint}</p>
        <div className="grid grid-cols-5 gap-2">
          {FARD.map((p: Fard) => {
            const st = (today[p] ?? "none") as Status;
            return (
              <button
                key={p}
                onClick={() => cycleStatus(p)}
                className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-3 transition-colors ${STATUS_CLS[st]}`}
              >
                <span className={`text-[11px] font-semibold ${bn}`}>
                  {tp[p.toLowerCase() as keyof typeof tp]}
                </span>
                <span className={`text-[9px] leading-tight ${bn}`}>{statusLabel[st]}</span>
              </button>
            );
          })}
        </div>

        {/* This week */}
        <div className="mt-5 flex items-center justify-between">
          <span className={`text-sm text-muted ${bn}`}>{tx.thisWeek}</span>
          <span className="font-display text-sm font-semibold text-text tabular-nums">
            {week.logged} / {week.total}
          </span>
        </div>

        {/* Heatmap */}
        <p className={`mt-5 mb-2 text-xs text-muted ${bn}`}>{tx.history}</p>
        <div className="grid grid-flow-col grid-rows-5 gap-1.5">
          {cells.map((c) => (
            <span key={c.key} className={`aspect-square rounded-[5px] ${heatCls(c.ratio)}`} title={c.key} />
          ))}
        </div>
      </div>
    </Card>
  );
}
