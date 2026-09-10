// Quran.com API v4 client (https://api.quran.com/api/v4) - free, no key,
// CORS-enabled. Chapters, verses (Uthmani Arabic + one-or-more translations +
// optional transliteration), and whole-surah audio for a choice of reciters.
// Results cached in localStorage. Translation/reciter ids are verified against
// /resources (131 - used previously - returns EMPTY; Saheeh Intl is 20).

const BASE = "https://api.quran.com/api/v4";

export const TRANSLITERATION_ID = 57;

// Default (free-tier) translation per language.
export const DEFAULT_TRANSLATION: Record<"en" | "bn", number> = { en: 20, bn: 161 };

// Curated translation options offered in the reader (premium unlocks multi-select).
export const TRANSLATION_OPTIONS: Record<"en" | "bn", { id: number; name: string }[]> = {
  en: [
    { id: 20, name: "Saheeh International" },
    { id: 85, name: "M.A.S. Abdel Haleem" },
    { id: 84, name: "Mufti Taqi Usmani" },
    { id: 22, name: "Abdullah Yusuf Ali" },
    { id: 19, name: "Marmaduke Pickthall" },
    { id: 95, name: "Abul A'la Maududi" },
  ],
  bn: [
    { id: 161, name: "Taisirul Quran" },
    { id: 213, name: "Dr. Abu Bakr Muhammad Zakaria" },
    { id: 163, name: "Sheikh Mujibur Rahman" },
    { id: 162, name: "Rawai Al-bayan" },
  ],
};

export const RECITERS: { id: number; name: string }[] = [
  { id: 7, name: "Mishari Rashid al-Afasy" },
  { id: 2, name: "AbdulBaset AbdulSamad" },
  { id: 3, name: "Abdur-Rahman as-Sudais" },
  { id: 4, name: "Abu Bakr al-Shatri" },
  { id: 6, name: "Mahmoud Khalil al-Husary" },
];
export const DEFAULT_RECITER = 7;

export function translationName(id: number): string {
  for (const lang of ["en", "bn"] as const) {
    const m = TRANSLATION_OPTIONS[lang].find((o) => o.id === id);
    if (m) return m.name;
  }
  return "";
}

export type Surah = {
  id: number;
  name_simple: string;
  name_arabic: string;
  translated_name: string;
  verses_count: number;
  revelation_place: "makkah" | "madinah";
};

export type Ayah = {
  id: number;
  verse_key: string; // "2:255"
  number_in_surah: number;
  text_uthmani: string;
  transliteration?: string;
  translations: { id: number; name: string; text: string }[];
};

async function cached<T>(key: string, url: string, pick: (j: unknown) => T): Promise<T> {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Quran API failed (${res.status})`);
  const value = pick(await res.json());
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota - ignore */
    }
  }
  return value;
}

type RawChapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: "makkah" | "madinah";
  translated_name: { name: string };
};

export async function getSurahs(lang: "en" | "bn"): Promise<Surah[]> {
  return cached<Surah[]>(`quran:surahs:${lang}`, `${BASE}/chapters?language=${lang}`, (j) =>
    (j as { chapters: RawChapter[] }).chapters.map((c) => ({
      id: c.id,
      name_simple: c.name_simple,
      name_arabic: c.name_arabic,
      translated_name: c.translated_name.name,
      verses_count: c.verses_count,
      revelation_place: c.revelation_place,
    }))
  );
}

type RawVerse = {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations?: { resource_id: number; text: string }[];
};

const stripHtml = (s: string) => s.replace(/<sup[^>]*>.*?<\/sup>/gi, "").replace(/<[^>]*>/g, "").trim();

export async function getAyahs(
  surahId: number,
  lang: "en" | "bn",
  opts: { translationIds: number[]; transliteration: boolean }
): Promise<Ayah[]> {
  // Always request at least the language default so a verse is never bare.
  const tset = opts.translationIds.length ? opts.translationIds : [DEFAULT_TRANSLATION[lang]];
  const requestIds = [...tset];
  if (opts.transliteration) requestIds.push(TRANSLITERATION_ID);

  const ids = requestIds.join(",");
  const url = `${BASE}/verses/by_chapter/${surahId}?language=${lang}&fields=text_uthmani&translations=${ids}&per_page=300`;
  const key = `quran:verses:${surahId}:${lang}:${ids}`;

  return cached<Ayah[]>(key, url, (j) =>
    (j as { verses: RawVerse[] }).verses.map((v) => {
      const byId = new Map((v.translations ?? []).map((t) => [t.resource_id, stripHtml(t.text)]));
      return {
        id: v.id,
        verse_key: v.verse_key,
        number_in_surah: Number(v.verse_key.split(":")[1]),
        text_uthmani: v.text_uthmani,
        transliteration: opts.transliteration ? byId.get(TRANSLITERATION_ID) : undefined,
        translations: tset
          .map((id) => ({ id, name: translationName(id), text: byId.get(id) ?? "" }))
          .filter((t) => t.text),
      };
    })
  );
}

// Tafsir (verse commentary). Ibn Kathir in both languages keeps it consistent.
const TAFSIR_ID: Record<"en" | "bn", number> = { en: 169, bn: 164 };

function cleanTafsir(html: string): string {
  return html
    .replace(/<\/(p|h2|h3|h4|div|li|tr)>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function getTafsir(verseKey: string, lang: "en" | "bn"): Promise<string> {
  const id = TAFSIR_ID[lang];
  const url = `${BASE}/tafsirs/${id}/by_ayah/${verseKey}`;
  return cached<string>(`quran:tafsir:${id}:${verseKey}`, url, (j) =>
    cleanTafsir((j as { tafsir?: { text?: string } }).tafsir?.text ?? "")
  );
}

export async function getSurahAudioUrl(surahId: number, reciterId = DEFAULT_RECITER): Promise<string> {
  const url = `${BASE}/chapter_recitations/${reciterId}/${surahId}`;
  return cached<string>(
    `quran:audio:${reciterId}:${surahId}`,
    url,
    (j) => (j as { audio_file: { audio_url: string } }).audio_file.audio_url
  );
}
