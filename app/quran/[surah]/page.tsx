"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { getAyahs, getSurahs, type Ayah, type Surah } from "@/lib/quran";
import {
  activeTranslationIds,
  ARABIC_SIZE_CLASS,
  loadPrefs,
  savePrefs,
  type ReaderPrefs,
} from "@/lib/reader-prefs";
import { isBookmarked, setLastRead, toggleBookmark, onChange as onBmChange } from "@/lib/bookmarks";
import { usePremiumStatus, UnlockChip, PremiumModal } from "@/components/PremiumGate";
import ReaderSettings from "@/components/ReaderSettings";
import AyahTafsir from "@/components/AyahTafsir";
import AudioPlayer from "@/components/AudioPlayer";
import Icon from "@/components/Icon";
import { Card, ErrorState, Skeleton, useMounted } from "@/components/ui";

export default function SurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah } = use(params);
  const surahId = Number(surah);
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].quran;
  const premium = usePremiumStatus();
  const mounted = useMounted();

  const [meta, setMeta] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[] | null>(null);
  const [error, setError] = useState(false);
  const [prefs, setPrefs] = useState<ReaderPrefs>(loadPrefs);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bmTick, setBmTick] = useState(0);
  const [upsellOpen, setUpsellOpen] = useState(false);

  useEffect(() => setPrefs(loadPrefs()), []);
  useEffect(() => onBmChange(() => setBmTick((n) => n + 1)), []);

  const updatePrefs = (p: ReaderPrefs) => {
    setPrefs(p);
    savePrefs(p);
  };

  const translationIds = activeTranslationIds(prefs, lang, premium);
  const transliteration = premium && prefs.transliteration;

  const load = () => {
    setError(false);
    setAyahs(null);
    Promise.all([
      getSurahs(lang),
      getAyahs(surahId, lang, { translationIds, transliteration }),
    ])
      .then(([surahs, verses]) => {
        const m = surahs.find((s) => s.id === surahId) ?? null;
        setMeta(m);
        setAyahs(verses);
        if (m) setLastRead({ surahId, ayah: 1, surahName: m.name_simple });
      })
      .catch(() => setError(true));
  };
  // Re-fetch when surah, language, translation set, or transliteration changes.
  useEffect(load, [surahId, lang, translationIds.join(","), transliteration]); // eslint-disable-line react-hooks/exhaustive-deps

  const showBismillah = surahId !== 1 && surahId !== 9;

  const handleBookmark = (a: Ayah) => {
    if (!premium) {
      setUpsellOpen(true);
      return;
    }
    toggleBookmark({
      surahId,
      ayah: a.number_in_surah,
      surahName: meta?.name_simple ?? `Surah ${surahId}`,
      text: a.text_uthmani.slice(0, 80),
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/quran" className={`inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text ${bn}`}>
          <Icon name="chevron-left" size={18} />
          {tx.title}
        </Link>
        <button
          onClick={() => setSettingsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-text-soft hover:bg-card-hi"
        >
          <Icon name="grid" size={15} />
          <span className={bn}>{t[lang].reader.settings}</span>
        </button>
      </div>

      {/* Surah header */}
      <Card className="atmo girih-bg mb-5 overflow-hidden border-border-strong p-6 text-center">
        {meta ? (
          <>
            <p className="arabic text-3xl text-white" style={{ direction: "rtl" }}>{meta.name_arabic}</p>
            <h1 className={`mt-2 font-display text-2xl font-semibold text-white ${bn}`}>{meta.name_simple}</h1>
            <p className={`mt-1 text-sm text-white/70 ${bn}`}>{meta.translated_name}</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/60">
              <span className={`rounded-full border border-white/20 px-2.5 py-0.5 ${bn}`}>
                {meta.revelation_place === "makkah" ? tx.makkah : tx.madinah}
              </span>
              <span className={`rounded-full border border-white/20 px-2.5 py-0.5 ${bn}`}>
                {meta.verses_count} {tx.verses}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-28" />
          </div>
        )}
      </Card>

      {/* Audio (premium) */}
      <div className="mb-5">
        {premium ? (
          <AudioPlayer surahId={surahId} reciterId={prefs.reciterId} />
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface text-muted">
              <Icon name="play" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium text-text ${bn}`}>{tx.playAudio}</p>
              <p className={`text-xs text-muted ${bn}`}>{tx.audioPremium}</p>
            </div>
            <UnlockChip />
          </div>
        )}
      </div>

      {showBismillah && (
        <p className="arabic mb-5 text-center text-2xl text-gold" style={{ direction: "rtl" }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </p>
      )}

      {/* Ayahs */}
      {error ? (
        <ErrorState message={t[lang].common.error} onRetry={load} retryLabel={t[lang].common.retry} />
      ) : !ayahs ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {ayahs.map((a) => {
            const saved = mounted && bmTick >= 0 && isBookmarked(surahId, a.number_in_surah);
            return (
              <Card key={a.id} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
                    {a.number_in_surah}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{a.verse_key}</span>
                    <button
                      onClick={() => handleBookmark(a)}
                      className={`transition-colors ${saved ? "text-gold" : "text-muted hover:text-gold"}`}
                      aria-label={t[lang].reader.save}
                      aria-pressed={saved}
                    >
                      <BookmarkIcon filled={!!saved} />
                    </button>
                  </div>
                </div>
                <p className={`arabic leading-loose text-text ${ARABIC_SIZE_CLASS[prefs.arabicSize]}`}>
                  {a.text_uthmani}
                </p>
                {a.transliteration && (
                  <p className="mt-3 text-sm italic leading-relaxed text-gold-soft">{a.transliteration}</p>
                )}
                {a.translations.map((tr) => (
                  <div key={tr.id} className="mt-4">
                    {a.translations.length > 1 && (
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{tr.name}</p>
                    )}
                    <p className={`text-sm leading-relaxed text-text-soft ${bn}`}>{tr.text}</p>
                  </div>
                ))}
                <AyahTafsir verseKey={a.verse_key} premium={premium} onUpsell={() => setUpsellOpen(true)} />
              </Card>
            );
          })}
        </div>
      )}

      <ReaderSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        onChange={updatePrefs}
        premium={premium}
      />
      <PremiumModal open={upsellOpen} onClose={() => setUpsellOpen(false)} />
    </div>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
      <path d="M6 4h12v17l-6-4-6 4z" />
    </svg>
  );
}
