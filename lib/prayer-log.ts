// Prayer (salah) tracking + streak. Premium. localStorage now; the same module
// is the seam for per-account sync in the platform_api phase.
//
// Model: one record per day keyed YYYY-MM-DD, each of the 5 fard prayers set to
// a status. A day "counts" toward the streak when all 5 are logged as prayed
// (on-time or late) - missed/qada/none break it. Streak is the retention hook.

export const FARD = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type Fard = (typeof FARD)[number];

export type Status = "none" | "ontime" | "late" | "qada";
export type DayLog = Partial<Record<Fard, Status>>;

const KEY = "hidayah_prayer_log";

export function dayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

type Store = Record<string, DayLog>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

function write(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("hidayah-prayerlog-change"));
}

export function getDay(key = dayKey()): DayLog {
  return read()[key] ?? {};
}

/** Cycle a prayer's status: none → ontime → late → qada → none. */
const NEXT: Record<Status, Status> = {
  none: "ontime",
  ontime: "late",
  late: "qada",
  qada: "none",
};

export function cycleStatus(prayer: Fard, key = dayKey()): void {
  if (typeof window === "undefined") return;
  const store = read();
  const day = { ...(store[key] ?? {}) };
  day[prayer] = NEXT[day[prayer] ?? "none"];
  store[key] = day;
  write(store);
}

export function setStatus(prayer: Fard, status: Status, key = dayKey()): void {
  if (typeof window === "undefined") return;
  const store = read();
  store[key] = { ...(store[key] ?? {}), [prayer]: status };
  write(store);
}

const dayComplete = (d: DayLog) => FARD.every((p) => d[p] === "ontime" || d[p] === "late");

/** Consecutive complete days ending today (or yesterday if today not yet done). */
export function currentStreak(): number {
  const store = read();
  let streak = 0;
  const cursor = new Date();
  // Allow today to be incomplete without breaking a streak earned through yesterday.
  if (!dayComplete(store[dayKey(cursor)] ?? {})) cursor.setDate(cursor.getDate() - 1);
  for (;;) {
    if (dayComplete(store[dayKey(cursor)] ?? {})) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

/** Count of individual prayers logged (ontime/late) over the last `days`. */
export function countLogged(days = 7): { logged: number; total: number } {
  const store = read();
  let logged = 0;
  const cursor = new Date();
  for (let i = 0; i < days; i++) {
    const d = store[dayKey(cursor)] ?? {};
    logged += FARD.filter((p) => d[p] === "ontime" || d[p] === "late").length;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { logged, total: days * FARD.length };
}

export type HeatCell = { key: string; ratio: number };

/** Most recent `days` (oldest→newest) with completion ratio for a heatmap. */
export function heatmap(days = 35): HeatCell[] {
  const store = read();
  const cells: HeatCell[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = store[dayKey(cursor)] ?? {};
    const done = FARD.filter((p) => d[p] === "ontime" || d[p] === "late").length;
    cells.push({ key: dayKey(cursor), ratio: done / FARD.length });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

export function onChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hidayah-prayerlog-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("hidayah-prayerlog-change", cb);
    window.removeEventListener("storage", cb);
  };
}
