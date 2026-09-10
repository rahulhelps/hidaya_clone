// Premium bookmarks + "continue reading" position. localStorage now; this is
// the seam for cross-device account sync in the platform_api phase.

export type Bookmark = {
  key: string; // `${surahId}:${ayah}`
  surahId: number;
  ayah: number;
  surahName: string;
  text: string; // short Arabic/excerpt for the list
  savedAt: number;
};

export type LastRead = {
  surahId: number;
  ayah: number;
  surahName: string;
};

const BM_KEY = "hidayah_bookmarks";
const LR_KEY = "hidayah_last_read";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function emit() {
  window.dispatchEvent(new Event("hidayah-bookmarks-change"));
}

export function getBookmarks(): Bookmark[] {
  return read<Bookmark[]>(BM_KEY, []).sort((a, b) => b.savedAt - a.savedAt);
}

export function isBookmarked(surahId: number, ayah: number): boolean {
  return read<Bookmark[]>(BM_KEY, []).some((b) => b.key === `${surahId}:${ayah}`);
}

export function toggleBookmark(b: Omit<Bookmark, "key" | "savedAt">): boolean {
  if (typeof window === "undefined") return false;
  const key = `${b.surahId}:${b.ayah}`;
  const list = read<Bookmark[]>(BM_KEY, []);
  const exists = list.some((x) => x.key === key);
  const next = exists
    ? list.filter((x) => x.key !== key)
    : [...list, { ...b, key, savedAt: Date.now() }];
  localStorage.setItem(BM_KEY, JSON.stringify(next));
  emit();
  return !exists;
}

export function removeBookmark(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BM_KEY, JSON.stringify(read<Bookmark[]>(BM_KEY, []).filter((b) => b.key !== key)));
  emit();
}

export function setLastRead(lr: LastRead): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LR_KEY, JSON.stringify(lr));
  emit();
}

export function getLastRead(): LastRead | null {
  return read<LastRead | null>(LR_KEY, null);
}

export function onChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("hidayah-bookmarks-change", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("hidayah-bookmarks-change", cb);
    window.removeEventListener("storage", cb);
  };
}
