// Quran completion ("khatm") plan. Premium. localStorage now; seam for sync
// in the platform_api phase.
//
// Model: the mushaf is 604 pages. A plan spreads them over N days; each day you
// confirm the day's portion read, which advances pagesRead and keeps a streak.

export const TOTAL_PAGES = 604;
export const PACE_OPTIONS = [30, 60, 90];

export type KhatmPlan = {
  targetDays: number;
  startDate: string; // YYYY-MM-DD
  pagesRead: number;
  lastReadDate: string | null;
  streak: number;
};

const KEY = "hidayah_khatm";

function dayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function getPlan(): KhatmPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KhatmPlan) : null;
  } catch {
    return null;
  }
}

function save(p: KhatmPlan | null) {
  if (p) localStorage.setItem(KEY, JSON.stringify(p));
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("hidayah-khatm-change"));
}

export function startPlan(targetDays: number): void {
  save({ targetDays, startDate: dayKey(), pagesRead: 0, lastReadDate: null, streak: 0 });
}

export function resetPlan(): void {
  save(null);
}

export function dailyTarget(p: KhatmPlan): number {
  return Math.ceil(TOTAL_PAGES / p.targetDays);
}

export function isComplete(p: KhatmPlan): boolean {
  return p.pagesRead >= TOTAL_PAGES;
}

export function doneToday(p: KhatmPlan): boolean {
  return p.lastReadDate === dayKey();
}

/** Page range for today's portion: [from, to] (1-indexed, inclusive). */
export function todayRange(p: KhatmPlan): [number, number] {
  const from = Math.min(p.pagesRead + 1, TOTAL_PAGES);
  const to = Math.min(p.pagesRead + dailyTarget(p), TOTAL_PAGES);
  return [from, to];
}

export function markTodayRead(): void {
  const p = getPlan();
  if (!p || doneToday(p) || isComplete(p)) return;
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  const streak = p.lastReadDate === yesterday ? p.streak + 1 : 1;
  save({
    ...p,
    pagesRead: Math.min(TOTAL_PAGES, p.pagesRead + dailyTarget(p)),
    lastReadDate: dayKey(),
    streak,
  });
}

export function onChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hidayah-khatm-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("hidayah-khatm-change", cb);
    window.removeEventListener("storage", cb);
  };
}
