// Hadith client over fawazahmed0/hadith-api served from the jsDelivr CDN -
// free, static, CORS-enabled. We read individual hadith by number so payloads
// stay small. A "daily" hadith is chosen deterministically from the day.

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";

export type Collection = {
  id: string;
  name: string;
  // edition slugs keyed by language; bn falls back to en when absent
  edition: { en: string; bn?: string };
  total: number;
};

// A focused, well-known set. `total` is the approximate hadith count used for
// bounding the number navigator and daily pick.
export const COLLECTIONS: Collection[] = [
  { id: "bukhari", name: "Sahih al-Bukhari", edition: { en: "eng-bukhari", bn: "ben-bukhari" }, total: 7563 },
  { id: "muslim", name: "Sahih Muslim", edition: { en: "eng-muslim", bn: "ben-muslim" }, total: 7563 },
  { id: "abudawud", name: "Sunan Abi Dawud", edition: { en: "eng-abudawud" }, total: 5274 },
  { id: "tirmidhi", name: "Jami` at-Tirmidhi", edition: { en: "eng-tirmidhi" }, total: 3956 },
  { id: "nasai", name: "Sunan an-Nasa'i", edition: { en: "eng-nasai" }, total: 5758 },
  { id: "nawawi", name: "40 Hadith Nawawi", edition: { en: "eng-nawawi" }, total: 42 },
];

export type Hadith = {
  number: number;
  text: string;
  translationBn?: string;
  collection: string;
};

async function fetchHadith(edition: string, number: number): Promise<string | null> {
  const url = `${CDN}/${edition}/${number}.min.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as { hadiths: { text: string }[] };
    return json.hadiths?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

export async function getHadith(c: Collection, number: number): Promise<Hadith> {
  const cacheKey = `hadith:${c.id}:${number}`;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) return JSON.parse(raw) as Hadith;
    } catch {
      /* ignore */
    }
  }
  const [en, bn] = await Promise.all([
    fetchHadith(c.edition.en, number),
    c.edition.bn ? fetchHadith(c.edition.bn, number) : Promise.resolve(null),
  ]);
  const result: Hadith = {
    number,
    text: en ?? "Hadith text unavailable.",
    translationBn: bn ?? undefined,
    collection: c.name,
  };
  if (typeof window !== "undefined" && en) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      /* ignore */
    }
  }
  return result;
}

/** Deterministic hadith-of-the-day from the 40 Hadith Nawawi (short, complete). */
export async function getDailyHadith(): Promise<Hadith> {
  const c = COLLECTIONS.find((x) => x.id === "nawawi")!;
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  const number = (dayOfYear % 40) + 1;
  return getHadith(c, number);
}
