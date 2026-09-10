// Prayer reminder settings + notification scheduling. Premium.
//
// PHASE 1: the app is an installable PWA; while it's open (incl. a background
// tab / installed window) we schedule local notifications for the rest of
// today's prayers via the Notification API. Reliable always-on delivery needs
// Web Push (a server + subscription) - that lands with the platform_api phase.

import { FARD, type Fard } from "./prayer-log";
import type { Timings } from "./aladhan";
import {
  getVapidKey,
  pushSubscribe,
  pushUnsubscribe,
  type PushSettingsPayload,
} from "./api";

export type ReminderSettings = {
  enabled: boolean;
  minutesBefore: number;
  prayers: Record<Fard, boolean>;
};

const KEY = "hidayah_reminders";

export const MINUTE_OPTIONS = [0, 5, 10, 15];

const DEFAULTS: ReminderSettings = {
  enabled: false,
  minutesBefore: 10,
  prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
};

export function loadReminders(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const v = JSON.parse(raw) as Partial<ReminderSettings>;
    return { ...DEFAULTS, ...v, prayers: { ...DEFAULTS.prayers, ...(v.prayers ?? {}) } };
  } catch {
    return DEFAULTS;
  }
}

export function saveReminders(s: ReminderSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function permissionState(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return Notification.requestPermission();
}

export async function notify(title: string, body: string): Promise<void> {
  if (permissionState() !== "granted") return;
  const opts: NotificationOptions = { body, icon: "/icon.svg", badge: "/icon.svg", tag: "hidayah-prayer" };
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, opts);
      return;
    }
  } catch {
    /* fall through to direct Notification */
  }
  new Notification(title, opts);
}

// ── Real Web Push (backend-delivered, fires even when the app is closed) ──
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/**
 * Ensure a Web-Push subscription exists and register it (with the user's
 * reminder settings) on the backend, which schedules the actual sends. Returns
 * false if push isn't supported or the backend has no VAPID key configured.
 */
export async function enablePush(settings: PushSettingsPayload): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const { publicKey } = await getVapidKey();
    if (!publicKey) return false; // backend VAPID not configured
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
  }
  await pushSubscribe(sub.toJSON() as PushSubscriptionJSON, settings);
  return true;
}

/** Push updated settings to the backend for the existing subscription. */
export async function syncPushSettings(settings: PushSettingsPayload): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return enablePush(settings);
  await pushSubscribe(sub.toJSON() as PushSubscriptionJSON, settings);
  return true;
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  try {
    await pushUnsubscribe(sub?.endpoint);
  } catch {
    /* ignore */
  }
  if (sub) await sub.unsubscribe();
}

/**
 * Schedule notifications for the prayers still ahead today. Returns a cleanup
 * that cancels the pending timers. `fire(prayer)` is called at each due time.
 */
export function scheduleToday(
  timings: Timings,
  settings: ReminderSettings,
  fire: (prayer: Fard) => void
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  if (!settings.enabled) return () => {};
  const now = Date.now();
  for (const p of FARD) {
    if (!settings.prayers[p]) continue;
    const [h, m] = timings[p].split(":").map(Number);
    const at = new Date();
    at.setHours(h, m - settings.minutesBefore, 0, 0);
    const delay = at.getTime() - now;
    // setTimeout caps near ~24.8 days; our delays are always < 24h, so fine.
    if (delay > 0) timers.push(setTimeout(() => fire(p), delay));
  }
  return () => timers.forEach(clearTimeout);
}
