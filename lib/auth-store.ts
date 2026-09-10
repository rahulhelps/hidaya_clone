// Browser-side persistence for the JWT pair issued by the platform after OTP
// verification. The premium subscription gate (lib/subscription.ts) reads this
// to decide whether premium features are unlocked.
//
// localStorage is intentional (no httpOnly cookies) to mirror the ThinkFast
// client; if we move to cookies later, only this module changes.

const STORAGE_KEY = "hidayah_auth";

export type AuthState = {
  accessToken: string;
  refreshToken: string;
  phoneNumber: string;
  userId: string;
};

export function saveAuth(auth: AuthState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    window.dispatchEvent(new Event("hidayah-auth-change"));
  } catch {
    /* quota / privacy mode - ignore */
  }
}

export function loadAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    if (
      typeof parsed.accessToken === "string" &&
      typeof parsed.refreshToken === "string" &&
      typeof parsed.phoneNumber === "string" &&
      typeof parsed.userId === "string"
    ) {
      return parsed as AuthState;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("hidayah-auth-change"));
  } catch {
    /* ignore */
  }
}
