// Premium-subscription status for the BDApps gate.
//
// LOGIN IS SUBSCRIPTION. The whole app sits behind a login wall (see
// components/AuthGate.tsx): the OTP "subscribe" flow both authenticates the user
// and enrols them in the carrier (BDApps) subscription, so an authenticated
// session *is* an active subscription. There is no logged-in-but-unsubscribed
// state - `isActive()` is therefore simply "do we have a session?".
//
// PHASE 1 (now): mock OTP. On a successful "subscribe" we save the JWT pair and
// set a localStorage flag the mock backend reads back.
// PHASE 2 (platform_api): `refresh()` confirms the carrier subscription is still
// live; if it has lapsed, we end the session so the login wall returns.

import { loadAuth, clearAuth } from "./auth-store";
import { getSubscriptionStatus } from "./api";

const SUB_KEY = "hidayah_premium";

export function isActive(): boolean {
  if (typeof window === "undefined") return false;
  // Login is subscription: any OTP-verified session is an active subscriber.
  return !!loadAuth();
}

/**
 * Keep the cached subscription flag in sync with the backend, for display only.
 * Like ThinkFast, the login wall gates purely on session presence - completing
 * the OTP flow IS the subscription - so this never tears down the session (only
 * an explicit unsubscribe, via `deactivate()`, does). A network error is a
 * no-op. The session is ended only via the account page's explicit unsubscribe.
 */
export async function refresh(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!loadAuth()) return false;
  try {
    const { active } = await getSubscriptionStatus();
    if (active) localStorage.setItem(SUB_KEY, "active");
    else localStorage.removeItem(SUB_KEY);
    window.dispatchEvent(new Event("hidayah-sub-change"));
  } catch {
    /* transient - keep the session as-is */
  }
  return isActive();
}

export function activate(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUB_KEY, "active");
  window.dispatchEvent(new Event("hidayah-sub-change"));
}

export function deactivate(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SUB_KEY);
  clearAuth();
  window.dispatchEvent(new Event("hidayah-sub-change"));
}

/**
 * Local sign-out: clears this device's session but KEEPS the BDApps
 * subscription. A later OTP re-login is recognised by the carrier as
 * already-registered, so the user is signed straight back in with no new
 * charge. (To actually cancel billing, use the unsubscribe flow → deactivate().)
 */
export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SUB_KEY);
  clearAuth();
  window.dispatchEvent(new Event("hidayah-sub-change"));
}

/** Subscribe to changes in either auth or subscription state. */
export function onChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hidayah-sub-change", cb);
  window.addEventListener("hidayah-auth-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("hidayah-sub-change", cb);
    window.removeEventListener("hidayah-auth-change", cb);
    window.removeEventListener("storage", cb);
  };
}
