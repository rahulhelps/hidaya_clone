// Cross-device sync for premium users. Each local store already broadcasts a
// change event; we debounce-push its blob to the backend, and on login we pull
// the server copy down. Last-write-wins. Free/unauthed users are untouched
// (everything stays in localStorage).

import { loadAuth } from "./auth-store";
import { isActive } from "./subscription";
import { syncPull, syncPush } from "./api";

type Entry = { backendKey: string; lsKey: string; event: string };

const ENTRIES: Entry[] = [
  { backendKey: "bookmarks", lsKey: "hidayah_bookmarks", event: "hidayah-bookmarks-change" },
  { backendKey: "prayer_log", lsKey: "hidayah_prayer_log", event: "hidayah-prayerlog-change" },
  { backendKey: "khatm", lsKey: "hidayah_khatm", event: "hidayah-khatm-change" },
  { backendKey: "reader_prefs", lsKey: "hidayah_reader_prefs", event: "hidayah-prefs-change" },
];

let hydrating = false;

/** Pull the server copy into localStorage and refresh the UI. Empty server
 *  values never clobber existing local data. */
export async function hydrateFromCloud(): Promise<void> {
  if (typeof window === "undefined" || !loadAuth() || !isActive()) return;
  try {
    const remote = await syncPull();
    hydrating = true;
    for (const e of ENTRIES) {
      const val = remote[e.backendKey];
      if (val === undefined || val === null) continue;
      localStorage.setItem(e.lsKey, JSON.stringify(val));
      window.dispatchEvent(new Event(e.event));
    }
  } catch {
    /* offline / not premium - keep local */
  } finally {
    hydrating = false;
  }
}

const timers: Record<string, ReturnType<typeof setTimeout>> = {};

function pushKey(e: Entry): void {
  if (hydrating || !loadAuth() || !isActive()) return;
  const raw = localStorage.getItem(e.lsKey);
  if (raw === null) return;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return;
  }
  clearTimeout(timers[e.backendKey]);
  timers[e.backendKey] = setTimeout(() => {
    void syncPush(e.backendKey, data).catch(() => {});
  }, 1200);
}

/** Attach change listeners that mirror local edits up to the backend. */
export function startSync(): () => void {
  if (typeof window === "undefined") return () => {};
  const handlers = ENTRIES.map((e) => {
    const handler = () => pushKey(e);
    window.addEventListener(e.event, handler);
    return { e, handler };
  });
  return () => handlers.forEach(({ e, handler }) => window.removeEventListener(e.event, handler));
}
