"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { localeDigits } from "@/lib/hijri";
import {
  getPlan,
  startPlan,
  resetPlan,
  markTodayRead,
  dailyTarget,
  doneToday,
  isComplete,
  todayRange,
  onChange,
  PACE_OPTIONS,
  TOTAL_PAGES,
  type KhatmPlan,
} from "@/lib/khatm";
import { usePremiumStatus, PremiumModal } from "@/components/PremiumGate";
import Icon from "./Icon";
import { Button, Card, useMounted } from "./ui";

export default function KhatmCard() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].khatm;
  const premium = usePremiumStatus();
  const mounted = useMounted();
  const [plan, setPlan] = useState<KhatmPlan | null>(null);
  const [upsell, setUpsell] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => setPlan(getPlan());
    sync();
    return onChange(sync);
  }, [mounted]);

  const num = (n: number) => localeDigits(n, lang);

  if (!premium) {
    return (
      <Card className="overflow-hidden">
        <div className="atmo girih-bg flex items-center gap-4 px-5 py-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-gold/40 bg-black/20 text-gold">
            <Icon name="book" size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={`font-display font-semibold text-white ${bn}`}>{tx.premiumTitle}</p>
            <p className={`text-xs text-white/70 ${bn}`}>{tx.premiumBody}</p>
          </div>
          <button onClick={() => setUpsell(true)} className="shrink-0 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
            <Icon name="lock" size={14} className="mr-1 inline" />
            {t[lang].common.unlock}
          </button>
        </div>
        <PremiumModal open={upsell} onClose={() => setUpsell(false)} />
      </Card>
    );
  }

  // No plan → choose pace
  if (!plan) {
    return (
      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Icon name="book" size={16} className="text-gold" />
          <p className={`font-display font-semibold text-text ${bn}`}>{tx.title}</p>
        </div>
        <p className={`mb-4 text-sm text-muted ${bn}`}>{tx.choosePace}</p>
        <div className="grid grid-cols-3 gap-2">
          {PACE_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => startPlan(d)}
              className="rounded-2xl border border-border bg-card py-4 text-center transition-colors hover:border-gold/40 hover:bg-card-hi"
            >
              <p className="font-display text-2xl font-semibold text-gold">{num(d)}</p>
              <p className={`text-xs text-muted ${bn}`}>{tx.days}</p>
            </button>
          ))}
        </div>
      </Card>
    );
  }

  const complete = isComplete(plan);
  const done = doneToday(plan) || complete;
  const [from, to] = todayRange(plan);
  const pct = Math.round((plan.pagesRead / TOTAL_PAGES) * 100);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Icon name="book" size={16} className="text-gold" />
          <p className={`font-medium text-text ${bn}`}>{tx.title}</p>
        </div>
        <button onClick={resetPlan} className="text-muted hover:text-text" aria-label={tx.reset}>
          <Icon name="refresh" size={16} />
        </button>
      </div>

      <div className="p-5">
        {/* Progress bar */}
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className={`text-muted ${bn}`}>{tx.progress}</span>
          <span className="font-semibold text-text tabular-nums">{num(pct)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-border/50">
          <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-xs text-muted">
          <span>{num(plan.pagesRead)} / {num(TOTAL_PAGES)} {tx.pages}</span>
          <span className={bn}>🔥 {num(plan.streak)} {tx.streak}</span>
        </div>

        {/* Today */}
        {complete ? (
          <div className={`mt-5 rounded-2xl border border-jade/40 bg-jade/10 px-4 py-4 text-center text-sm font-medium text-jade ${bn}`}>
            {tx.complete}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-border bg-surface p-4 text-center">
            <p className={`text-xs text-muted ${bn}`}>{tx.todayPortion}</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-text">
              {tx.page} {num(from)}–{num(to)}
            </p>
            {done ? (
              <p className={`mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-jade ${bn}`}>
                <Icon name="check" size={16} /> {tx.doneToday}
              </p>
            ) : (
              <Button className="mt-3 w-full py-3" onClick={markTodayRead}>
                <Icon name="check" size={18} />
                <span className={bn}>{tx.markDone}</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
