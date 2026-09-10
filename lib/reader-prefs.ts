// Quran reader preferences. Free tier is locked to a single default translation
// with no transliteration; premium unlocks multi-translation, transliteration,
// and reciter choice. Arabic font size is free (accessibility).
//
// Stored in localStorage now; the same module is the seam for per-account sync
// in the platform_api phase.

import { DEFAULT_RECITER, TRANSLATION_OPTIONS } from "./quran";

export type ArabicSize = "sm" | "md" | "lg";

export type ReaderPrefs = {
  translationIds: number[];
  transliteration: boolean;
  arabicSize: ArabicSize;
  reciterId: number;
};

const KEY = "hidayah_reader_prefs";

const DEFAULTS: ReaderPrefs = {
  translationIds: [],
  transliteration: false,
  arabicSize: "md",
  reciterId: DEFAULT_RECITER,
};

export function loadPrefs(): ReaderPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReaderPrefs>) };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(p: ReaderPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event("hidayah-prefs-change"));
  } catch {
    /* ignore */
  }
}

/** Which translation ids actually apply for `lang` given prefs + entitlement. */
export function activeTranslationIds(
  prefs: ReaderPrefs,
  lang: "en" | "bn",
  premium: boolean
): number[] {
  const options = new Set(TRANSLATION_OPTIONS[lang].map((o) => o.id));
  const fallback = [TRANSLATION_OPTIONS[lang][0].id];
  if (!premium) return fallback;
  const chosen = prefs.translationIds.filter((id) => options.has(id));
  return chosen.length ? chosen : fallback;
}

export const ARABIC_SIZE_CLASS: Record<ArabicSize, string> = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-[1.7rem]",
  lg: "text-3xl sm:text-4xl",
};
