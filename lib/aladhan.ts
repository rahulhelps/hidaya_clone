// Aladhan API client (https://aladhan.com/prayer-times-api) - free, no key,
// CORS-enabled. Prayer times, hijri date, and monthly calendar. Responses are
// cached in localStorage per (place, day/method) so repeat visits are instant
// and resilient to brief network failures.

import type { Coords } from "./geo";

export const CALC_METHODS: { id: number; name: string }[] = [
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm al-Qura, Makkah" },
  { id: 5, name: "Egyptian General Authority" },
  { id: 8, name: "Gulf Region" },
  { id: 12, name: "Union des Organisations Islamiques de France" },
];

export const DEFAULT_METHOD = 1;
const METHOD_KEY = "hidayah_method";

export function loadMethod(): number {
  if (typeof window === "undefined") return DEFAULT_METHOD;
  const v = Number(localStorage.getItem(METHOD_KEY));
  return CALC_METHODS.some((m) => m.id === v) ? v : DEFAULT_METHOD;
}
export function saveMethod(id: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(METHOD_KEY, String(id));
  window.dispatchEvent(new Event("hidayah-method-change"));
}

export type Timings = {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

export type HijriDate = {
  day: string;
  month: { number: number; en: string; ar: string };
  year: string;
  weekday: { en: string; ar: string };
  designation: { abbreviated: string };
  holidays: string[];
};

export type DayTimes = {
  timings: Timings;
  hijri: HijriDate;
  gregorian: { date: string; weekday: { en: string } };
};

const BASE = "https://api.aladhan.com/v1";

function ddmmyyyy(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
}

async function cachedJson<T>(key: string, url: string, ttlMs: number): Promise<T> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const { t, v } = JSON.parse(raw) as { t: number; v: T };
        if (Date.now() - t < ttlMs) return v;
      }
    } catch {
      /* ignore */
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Aladhan request failed (${res.status})`);
  const json = (await res.json()) as { data: T };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: json.data }));
    } catch {
      /* quota - ignore */
    }
  }
  return json.data;
}

type RawDay = {
  timings: Record<string, string>;
  date: { hijri: HijriDate; gregorian: { date: string; weekday: { en: string } } };
};

const clean = (t: string) => t.replace(/\s*\(.*\)\s*/, "").trim();

export async function getDayTimes(
  coords: Coords,
  method: number,
  date = new Date()
): Promise<DayTimes> {
  const key = `aladhan:${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}:${method}:${ddmmyyyy(date)}`;
  const url = `${BASE}/timings/${ddmmyyyy(date)}?latitude=${coords.lat}&longitude=${coords.lng}&method=${method}`;
  const data = await cachedJson<RawDay>(key, url, 6 * 60 * 60 * 1000);
  return {
    timings: {
      Fajr: clean(data.timings.Fajr),
      Sunrise: clean(data.timings.Sunrise),
      Dhuhr: clean(data.timings.Dhuhr),
      Asr: clean(data.timings.Asr),
      Maghrib: clean(data.timings.Maghrib),
      Isha: clean(data.timings.Isha),
    },
    hijri: data.date.hijri,
    gregorian: data.date.gregorian,
  };
}

export type CalendarDay = {
  gregorianDay: number;
  hijriDay: string;
  hijriMonthNumber: number;
  holidays: string[];
  timings: Timings;
};

export async function getMonthCalendar(
  coords: Coords,
  method: number,
  year: number,
  month: number
): Promise<CalendarDay[]> {
  const key = `aladhan-cal:${coords.lat.toFixed(2)},${coords.lng.toFixed(2)}:${method}:${year}-${month}`;
  const url = `${BASE}/calendar/${year}/${month}?latitude=${coords.lat}&longitude=${coords.lng}&method=${method}`;
  const data = await cachedJson<RawDay[]>(key, url, 24 * 60 * 60 * 1000);
  return data.map((d) => ({
    gregorianDay: Number(d.date.gregorian.date.split("-")[0]),
    hijriDay: d.date.hijri.day,
    hijriMonthNumber: d.date.hijri.month.number,
    holidays: d.date.hijri.holidays,
    timings: {
      Fajr: clean(d.timings.Fajr),
      Sunrise: clean(d.timings.Sunrise),
      Dhuhr: clean(d.timings.Dhuhr),
      Asr: clean(d.timings.Asr),
      Maghrib: clean(d.timings.Maghrib),
      Isha: clean(d.timings.Isha),
    },
  }));
}

export async function getHijriToday(): Promise<HijriDate> {
  const today = new Date();
  const key = `aladhan-h:${ddmmyyyy(today)}`;
  const url = `${BASE}/gToH/${ddmmyyyy(today)}`;
  const data = await cachedJson<{ hijri: HijriDate }>(key, url, 12 * 60 * 60 * 1000);
  return data.hijri;
}
