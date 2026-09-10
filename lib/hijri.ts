// Localized Hijri month names + numerals.
//
// Aladhan returns academic transliterations with diacritics (e.g.
// "Dhū al-Ḥijjah", "Rabīʿ al-awwal") that are hard to read - and useless in
// Bangla mode. We key off the month NUMBER (1–12) and render our own clean
// English and Bangla names instead.

export const HIJRI_MONTHS: Record<number, { en: string; bn: string }> = {
  1: { en: "Muharram", bn: "মহররম" },
  2: { en: "Safar", bn: "সফর" },
  3: { en: "Rabi al-Awwal", bn: "রবিউল আউয়াল" },
  4: { en: "Rabi al-Thani", bn: "রবিউস সানি" },
  5: { en: "Jumada al-Awwal", bn: "জমাদিউল আউয়াল" },
  6: { en: "Jumada al-Thani", bn: "জমাদিউস সানি" },
  7: { en: "Rajab", bn: "রজব" },
  8: { en: "Shaban", bn: "শাবান" },
  9: { en: "Ramadan", bn: "রমজান" },
  10: { en: "Shawwal", bn: "শাওয়াল" },
  11: { en: "Dhul Qadah", bn: "জিলক্বদ" },
  12: { en: "Dhul Hijjah", bn: "জিলহজ্জ" },
};

export function hijriMonth(num: number, lang: "en" | "bn"): string {
  return HIJRI_MONTHS[num]?.[lang] ?? "";
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Western digits → Bangla numerals in BN mode, unchanged in EN. */
export function localeDigits(value: string | number, lang: "en" | "bn"): string {
  const s = String(value);
  return lang === "bn" ? s.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]) : s;
}

export const YEAR_SUFFIX = { en: "AH", bn: "হিজরি" };
