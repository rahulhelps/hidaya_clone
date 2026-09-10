"use client";

import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { formatCountdown, to12h, type NextPrayer } from "@/lib/prayer-utils";
import type { Atmosphere } from "@/lib/prayer-utils";
import type { Place } from "@/lib/geo";
import Icon from "./Icon";

const pad = (n: number) => String(n).padStart(2, "0");

export default function PrayerHero({
  next,
  atmo,
  place,
  locating,
  onDetect,
}: {
  next: NextPrayer | null;
  atmo: Atmosphere | null;
  place: Place | null;
  locating: boolean;
  onDetect: () => void;
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang];

  const R = 86;
  const C = 2 * Math.PI * R;
  const progress = next?.progress ?? 0;
  const cd = next ? formatCountdown(next.inSeconds) : { h: 0, m: 0, s: 0 };
  const nextName = next ? tx.prayer[next.key.toLowerCase() as keyof typeof tx.prayer] : "";
  const nextAt = next ? to12h(`${pad(next.at.getHours())}:${pad(next.at.getMinutes())}`) : null;

  return (
    <section
      className="atmo girih-bg relative overflow-hidden rounded-[1.75rem] border border-border-strong p-6 sm:p-8 fade-up"
      style={
        atmo
          ? ({ ["--atmo-1" as string]: atmo.c1, ["--atmo-2" as string]: atmo.c2 } as React.CSSProperties)
          : undefined
      }
    >
      {/* Location chip */}
      <button
        onClick={onDetect}
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur transition hover:bg-black/30"
      >
        <Icon name="location" size={14} />
        <span className={bn}>{locating ? tx.home.locating : place?.city ?? "-"}</span>
      </button>

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Countdown arc */}
        <div className="relative grid place-items-center">
          <svg width="208" height="208" viewBox="0 0 208 208" className="-rotate-90">
            <circle cx="104" cy="104" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="6" />
            <circle
              cx="104"
              cy="104"
              r={R}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              style={{ transition: "stroke-dashoffset 1s linear", filter: "drop-shadow(0 0 6px var(--gold))" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <p className={`text-[11px] uppercase tracking-[0.2em] text-white/60 ${bn}`}>{tx.home.nextPrayer}</p>
              <p className={`font-display text-2xl font-semibold text-white ${bn}`}>{nextName}</p>
            </div>
          </div>
        </div>

        {/* Countdown digits + time */}
        <div className="flex-1 text-center sm:text-left">
          <p className={`text-sm text-white/60 ${bn}`}>
            {next && next.inSeconds === 0 ? tx.home.remainingNow : tx.home.in}
          </p>
          <div className="mt-1 flex items-baseline justify-center gap-1 sm:justify-start">
            {[cd.h, cd.m, cd.s].map((v, i) => (
              <span key={i} className="flex items-baseline">
                {i > 0 && <span className="px-1 text-2xl font-light text-white/40">:</span>}
                <span className="font-display text-5xl font-semibold tabular-nums text-gilded sm:text-6xl">
                  {pad(v)}
                </span>
              </span>
            ))}
          </div>
          {nextAt && (
            <p className={`mt-3 text-sm text-white/70 ${bn}`}>
              {tx.home.at}{" "}
              <span className="font-semibold text-white">
                {nextAt.time} {nextAt.meridiem}
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
