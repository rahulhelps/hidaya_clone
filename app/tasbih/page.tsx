"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import Icon from "@/components/Icon";
import { Card, PageHeader, useMounted } from "@/components/ui";

const PRESETS = [
  { id: "subhanallah", ar: "سُبْحَانَ ٱللَّه", tr: "SubhanAllah", target: 33 },
  { id: "alhamdulillah", ar: "ٱلْحَمْدُ لِلَّه", tr: "Alhamdulillah", target: 33 },
  { id: "allahuakbar", ar: "ٱللَّهُ أَكْبَر", tr: "Allahu Akbar", target: 34 },
  { id: "tahlil", ar: "لَا إِلَٰهَ إِلَّا ٱللَّه", tr: "La ilaha illAllah", target: 100 },
  { id: "istighfar", ar: "أَسْتَغْفِرُ ٱللَّه", tr: "Astaghfirullah", target: 100 },
];

export default function TasbihPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].tasbih;
  const mounted = useMounted();

  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [count, setCount] = useState(0);
  const [sets, setSets] = useState(0);

  const preset = PRESETS.find((p) => p.id === presetId)!;

  // Load persisted state for the active dhikr.
  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(`hidayah_tasbih_${presetId}`);
      const v = raw ? (JSON.parse(raw) as { count: number; sets: number }) : { count: 0, sets: 0 };
      setCount(v.count);
      setSets(v.sets);
    } catch {
      setCount(0);
      setSets(0);
    }
  }, [presetId, mounted]);

  const persist = (c: number, s: number) => {
    try {
      localStorage.setItem(`hidayah_tasbih_${presetId}`, JSON.stringify({ count: c, sets: s }));
    } catch {
      /* ignore */
    }
  };

  const buzz = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
  };

  const inc = () => {
    let c = count + 1;
    let s = sets;
    if (c >= preset.target) {
      s += 1;
      c = 0;
      buzz([20, 40, 80]);
    } else {
      buzz(15);
    }
    setCount(c);
    setSets(s);
    persist(c, s);
  };

  const reset = () => {
    setCount(0);
    setSets(0);
    persist(0, 0);
    buzz(30);
  };

  const R = 120;
  const C = 2 * Math.PI * R;
  const progress = count / preset.target;

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Dhikr presets */}
      <div className="mb-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPresetId(p.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              p.id === presetId ? "border-gold bg-gold text-on-gold" : "border-border bg-card text-text-soft hover:bg-card-hi"
            }`}
          >
            {p.tr}
          </button>
        ))}
      </div>

      {/* Counter */}
      <Card className="atmo girih-bg overflow-hidden border-border-strong">
        <div className="flex flex-col items-center px-6 py-8">
          <p className="arabic text-3xl text-gilded" style={{ direction: "rtl" }}>{preset.ar}</p>

          <button
            onClick={inc}
            className="group relative mt-6 grid h-72 w-72 place-items-center rounded-full"
            aria-label={tx.tapToCount}
          >
            <svg width="288" height="288" viewBox="0 0 288 288" className="-rotate-90">
              <circle cx="144" cy="144" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="10" />
              <circle
                cx="144"
                cy="144"
                r={R}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                style={{ transition: "stroke-dashoffset 0.2s ease", filter: "drop-shadow(0 0 8px var(--gold))" }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-40 w-40 place-items-center rounded-full border border-white/15 bg-black/25 backdrop-blur transition-transform group-active:scale-95">
                <span className="font-display text-6xl font-semibold tabular-nums text-white">{count}</span>
                <span className="text-sm text-white/50">/ {preset.target}</span>
              </div>
            </div>
          </button>

          <p className={`mt-5 text-sm text-white/60 ${bn}`}>{tx.tapToCount}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
          <Stat label={tx.count} value={count} bn={bn} />
          <Stat label={tx.sets} value={sets} bn={bn} />
          <button onClick={reset} className="flex flex-col items-center justify-center gap-1 py-4 text-muted transition-colors hover:text-gold">
            <Icon name="refresh" size={18} />
            <span className={`text-xs font-medium ${bn}`}>{tx.reset}</span>
          </button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, bn }: { label: string; value: number; bn: string }) {
  return (
    <div className="py-4 text-center">
      <p className="font-display text-2xl font-semibold tabular-nums text-text">{value}</p>
      <p className={`text-xs text-muted ${bn}`}>{label}</p>
    </div>
  );
}
