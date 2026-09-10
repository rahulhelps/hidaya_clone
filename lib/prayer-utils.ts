// Next-prayer / countdown logic + the time-of-day "atmosphere" that drives the
// home hero's gradient mood. Pure functions over a Timings object.

import type { Timings } from "./aladhan";

export type PrayerKey = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";

export const PRAYER_ORDER: PrayerKey[] = [
  "Fajr",
  "Sunrise",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

// Sunrise is shown but is not a salah - exclude from "next prayer" highlighting.
export const SALAH: PrayerKey[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

/** Parse "HH:MM" into a Date on the given day. */
export function toDate(hhmm: string, base: Date): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export type NextPrayer = {
  key: PrayerKey;
  at: Date;
  /** Whole seconds until it begins (>= 0). */
  inSeconds: number;
  /** Fraction [0,1] elapsed in the current prayer window, for the arc. */
  progress: number;
};

export function nextPrayer(timings: Timings, now = new Date()): NextPrayer {
  const todays = SALAH.map((k) => ({ key: k, at: toDate(timings[k], now) }));
  const upcoming = todays.find((p) => p.at.getTime() > now.getTime());

  // Window we're currently inside (previous salah → next salah) for progress.
  let prevAt: Date;
  let target: { key: PrayerKey; at: Date };
  if (upcoming) {
    target = upcoming;
    const idx = todays.indexOf(upcoming);
    prevAt = idx > 0 ? todays[idx - 1].at : toDate("00:00", now);
  } else {
    // After Isha → next is tomorrow's Fajr.
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    target = { key: "Fajr", at: toDate(timings.Fajr, tomorrow) };
    prevAt = toDate(timings.Isha, now);
  }

  const total = target.at.getTime() - prevAt.getTime();
  const elapsed = now.getTime() - prevAt.getTime();
  const progress = total > 0 ? Math.min(1, Math.max(0, elapsed / total)) : 0;

  return {
    key: target.key,
    at: target.at,
    inSeconds: Math.max(0, Math.floor((target.at.getTime() - now.getTime()) / 1000)),
    progress,
  };
}

export function formatCountdown(seconds: number): { h: number; m: number; s: number } {
  return {
    h: Math.floor(seconds / 3600),
    m: Math.floor((seconds % 3600) / 60),
    s: seconds % 60,
  };
}

/** 12-hour display, e.g. "5:41 AM". */
export function to12h(hhmm: string): { time: string; meridiem: string } {
  const [h, m] = hhmm.split(":").map(Number);
  const meridiem = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return { time: `${hr}:${String(m).padStart(2, "0")}`, meridiem };
}

// ── Atmosphere: which gradient mood the page wears right now ──
export type Atmosphere = {
  phase: "fajr" | "sunrise" | "day" | "afternoon" | "maghrib" | "night";
  c1: string; // upper radial
  c2: string; // lower radial
};

const ATMOS: Record<Atmosphere["phase"], { c1: string; c2: string }> = {
  fajr: { c1: "#27406b", c2: "#11243f" },
  sunrise: { c1: "#3f5f86", c2: "#7c6a4d" },
  day: { c1: "#1d5773", c2: "#0e2b34" },
  afternoon: { c1: "#5b6a4a", c2: "#26331f" },
  maghrib: { c1: "#8a4b35", c2: "#3a1f2e" },
  night: { c1: "#1a3550", c2: "#070f15" },
};

export function atmosphereFor(timings: Timings, now = new Date()): Atmosphere {
  const t = (k: PrayerKey) => toDate(timings[k], now).getTime();
  const ms = now.getTime();
  let phase: Atmosphere["phase"];
  if (ms < t("Fajr")) phase = "night";
  else if (ms < t("Sunrise")) phase = "fajr";
  else if (ms < toDate(timings.Sunrise, now).getTime() + 60 * 60 * 1000) phase = "sunrise";
  else if (ms < t("Dhuhr")) phase = "day";
  else if (ms < t("Maghrib")) phase = "afternoon";
  else if (ms < t("Maghrib") + 75 * 60 * 1000) phase = "maghrib";
  else phase = "night";
  return { phase, ...ATMOS[phase] };
}
