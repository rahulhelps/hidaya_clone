"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { getSurahs, type Surah } from "@/lib/quran";
import { getLastRead, onChange, type LastRead } from "@/lib/bookmarks";
import { usePremiumStatus } from "@/components/PremiumGate";
import KhatmCard from "@/components/KhatmCard";
import Icon from "@/components/Icon";
import { Card, ErrorState, PageHeader, Skeleton, useMounted } from "@/components/ui";

export default function QuranPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].quran;

  const premium = usePremiumStatus();
  const mounted = useMounted();
  const [surahs, setSurahs] = useState<Surah[] | null>(null);
  const [error, setError] = useState(false);
  const [q, setQ] = useState("");
  const [lastRead, setLR] = useState<LastRead | null>(null);

  const load = () => {
    setError(false);
    getSurahs(lang).then(setSurahs).catch(() => setError(true));
  };
  useEffect(load, [lang]);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => setLR(getLastRead());
    sync();
    return onChange(sync);
  }, [mounted]);

  const filtered = useMemo(() => {
    if (!surahs) return [];
    const s = q.trim().toLowerCase();
    if (!s) return surahs;
    return surahs.filter(
      (x) =>
        x.name_simple.toLowerCase().includes(s) ||
        x.translated_name.toLowerCase().includes(s) ||
        String(x.id) === s
    );
  }, [surahs, q]);

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Continue reading + bookmarks */}
      <div className="mb-4 flex items-center gap-2">
        {premium && lastRead && (
          <Link href={`/quran/${lastRead.surahId}`} className="min-w-0 flex-1">
            <Card className="flex items-center gap-2.5 px-3.5 py-2.5 transition-colors hover:border-gold/40 hover:bg-card-hi">
              <Icon name="book" size={16} className="shrink-0 text-gold" />
              <span className={`truncate text-xs text-muted ${bn}`}>
                {t[lang].bookmarks.continueReading}: <span className="font-medium text-text">{lastRead.surahName}</span>
              </span>
            </Card>
          </Link>
        )}
        <Link
          href="/bookmarks"
          className={`ml-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-text-soft hover:bg-card-hi ${bn}`}
        >
          <Icon name="star" size={15} className="text-gold" />
          {t[lang].nav.bookmarks}
        </Link>
      </div>

      <div className="mb-5">
        <KhatmCard />
      </div>

      <div className="relative mb-5">
        <Icon name="search" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tx.searchPlaceholder}
          className={`w-full rounded-2xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-text outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20 ${bn}`}
        />
      </div>

      {error ? (
        <ErrorState message={t[lang].common.error} onRetry={load} retryLabel={t[lang].common.retry} />
      ) : !surahs ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <Link
              key={s.id}
              href={`/quran/${s.id}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3.5 transition-colors hover:border-gold/40 hover:bg-card-hi"
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
            >
              <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                <svg viewBox="0 0 44 44" className="absolute inset-0 text-gold/30">
                  <path
                    d="M22 2 27 7l7-1-1 7 5 5-5 5 1 7-7-1-5 5-5-5-7 1 1-7-5-5 5-5-1-7 7 1z"
                    fill="currentColor"
                    fillOpacity="0.12"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </svg>
                <span className="font-display text-sm font-semibold text-gold">{s.id}</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-text">{s.name_simple}</p>
                <p className={`text-xs text-muted ${bn}`}>
                  {s.translated_name} · {s.verses_count} {tx.verses}
                </p>
              </div>
              <span className="arabic text-xl text-text-soft" style={{ direction: "rtl" }}>
                {s.name_arabic}
              </span>
              <Icon name="chevron-right" size={18} className="text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
