"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { usePrayerData, useCountdown } from "@/lib/use-prayer";
import { hijriMonth, localeDigits, YEAR_SUFFIX } from "@/lib/hijri";
import { getDailyHadith, type Hadith } from "@/lib/hadith";
import { getStoryOfDay, type StoryOfDay } from "@/lib/api";
import PrayerHero from "@/components/PrayerHero";
import PrayerTimesRow from "@/components/PrayerTimesRow";
import Icon, { type IconName } from "@/components/Icon";
import { Card, Skeleton, useMounted } from "@/components/ui";

const VERSES = [
  {
    ar: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    en: "Indeed, with hardship comes ease.",
    bn: "নিশ্চয়ই কষ্টের সাথে স্বস্তি রয়েছে।",
    ref: "Ash-Sharh 94:6",
  },
  {
    ar: "فَٱذْكُرُونِي أَذْكُرْكُمْ",
    en: "So remember Me; I will remember you.",
    bn: "অতএব তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করব।",
    ref: "Al-Baqarah 2:152",
  },
  {
    ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    en: "And He is with you wherever you are.",
    bn: "আর তোমরা যেখানেই থাকো না কেন, তিনি তোমাদের সাথেই আছেন।",
    ref: "Al-Hadid 57:4",
  },
  {
    ar: "ٱلَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ ٱللَّهِ",
    en: "Those who believe, and whose hearts find rest in the remembrance of Allah.",
    bn: "যারা ঈমান এনেছে এবং আল্লাহর স্মরণে যাদের অন্তর প্রশান্তি লাভ করে।",
    ref: "Ar-Ra'd 13:28",
  },
];

const QUICK: { href: string; key: keyof (typeof t)["en"]["nav"]; icon: IconName }[] = [
  { href: "/quran", key: "quran", icon: "book" },
  { href: "/qibla", key: "qibla", icon: "compass" },
  { href: "/duas", key: "duas", icon: "hands" },
  { href: "/names", key: "names", icon: "sparkle" },
  { href: "/tasbih", key: "tasbih", icon: "beads" },
  { href: "/calendar", key: "calendar", icon: "calendar" },
];

function greetingKey(phase?: string) {
  switch (phase) {
    case "fajr":
      return "greetingDawn" as const;
    case "sunrise":
    case "day":
      return "greetingMorning" as const;
    case "afternoon":
      return "greetingAfternoon" as const;
    case "maghrib":
      return "greetingEvening" as const;
    default:
      return "greetingNight" as const;
  }
}

export default function HomePage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang];
  const mounted = useMounted();

  const { place, times, loading, locating, detect } = usePrayerData();
  const { next, atmo } = useCountdown(times);

  const [hadith, setHadith] = useState<Hadith | null>(null);
  useEffect(() => {
    getDailyHadith().then(setHadith).catch(() => {});
  }, []);

  const [story, setStory] = useState<StoryOfDay | null>(null);
  useEffect(() => {
    getStoryOfDay().then(setStory).catch(() => {});
  }, []);

  const verse = VERSES[mounted ? new Date().getDate() % VERSES.length : 0];

  return (
    <div className="space-y-7">
      {/* Greeting + hijri */}
      <div className="flex items-end justify-between gap-3 fade-up">
        <div>
          <p className={`text-sm text-muted ${bn}`}>{tx.home[greetingKey(atmo?.phase)]}</p>
          <h1 className={`font-display text-2xl font-semibold tracking-tight text-text ${bn}`}>
            {tx.appName}
          </h1>
        </div>
        {times && (
          <div className="text-right">
            <p className={`font-display text-base font-semibold text-gold ${bn}`}>
              {localeDigits(times.hijri.day, lang)} {hijriMonth(times.hijri.month.number, lang)}
            </p>
            <p className={`text-xs text-muted ${bn}`}>
              {localeDigits(times.hijri.year, lang)} {YEAR_SUFFIX[lang]}
            </p>
          </div>
        )}
      </div>

      {/* Hero */}
      {loading && !times ? (
        <Skeleton className="h-64 w-full rounded-[1.75rem]" />
      ) : (
        <PrayerHero next={next} atmo={atmo} place={place} locating={locating} onDetect={detect} />
      )}

      {/* Today's prayers */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className={`font-display text-lg font-semibold text-text ${bn}`}>{tx.home.todaysPrayers}</h2>
          <Link href="/prayer" className={`text-sm font-medium text-gold hover:underline ${bn}`}>
            {tx.common.viewAll}
          </Link>
        </div>
        {times ? (
          <PrayerTimesRow timings={times.timings} nextKey={next?.key} />
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
      </section>

      {/* Quick access */}
      <section>
        <h2 className={`mb-3 font-display text-lg font-semibold text-text ${bn}`}>{tx.home.quickAccess}</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-gold/40 hover:bg-card-hi"
            >
              <span className="text-gold transition-transform group-hover:scale-110">
                <Icon name={q.icon} size={24} />
              </span>
              <span className={`text-center text-xs font-medium text-text-soft ${bn}`}>{tx.nav[q.key]}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI assistant teaser - deliberately static, so the app's hottest route
          costs no extra requests. */}
      <Link href="/chat" className="block">
        <Card className="overflow-hidden transition-colors hover:border-gold/40 hover:bg-card-hi">
          <div className="girih-bg flex items-center gap-4 px-5 py-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border-strong bg-card text-gold">
              <Icon name="chat" size={22} />
            </span>
            <div className="min-w-0">
              <h3 className={`font-display text-base font-semibold text-text ${bn}`}>
                {tx.chat.teaserTitle}
              </h3>
              <p className={`mt-0.5 line-clamp-2 text-sm text-text-soft ${bn}`}>
                {tx.chat.teaserBody}
              </p>
            </div>
            <span className="ml-auto shrink-0 text-muted">
              <Icon name="chevron-right" size={18} />
            </span>
          </div>
        </Card>
      </Link>

      {/* Daily verse */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <p className={`text-xs font-semibold uppercase tracking-wider text-gold ${bn}`}>{tx.home.dailyVerse}</p>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="arabic text-2xl text-text sm:text-3xl">{verse.ar}</p>
          <p className={`mx-auto mt-4 max-w-md text-sm text-text-soft ${bn}`}>
            {lang === "en" ? verse.en : verse.bn}
          </p>
          <p className="mt-2 text-xs font-medium text-muted">{verse.ref}</p>
        </div>
      </Card>

      {/* Daily hadith */}
      <Link href="/hadith" className="block">
        <Card className="p-5 transition-colors hover:border-gold/40 hover:bg-card-hi">
          <div className="mb-2 flex items-center gap-2">
            <Icon name="scroll" size={16} className="text-gold" />
            <p className={`text-xs font-semibold uppercase tracking-wider text-gold ${bn}`}>{tx.home.dailyHadith}</p>
          </div>
          {hadith ? (
            <>
              <p className="line-clamp-3 text-sm leading-relaxed text-text-soft">{hadith.text}</p>
              <p className="mt-2 text-xs font-medium text-muted">{hadith.collection}</p>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          )}
        </Card>
      </Link>

      {/* Story of the day */}
      {story && (
        <Link href="/story" className="block">
          <Card className="p-5 transition-colors hover:border-gold/40 hover:bg-card-hi">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="book" size={16} className="text-gold" />
              <p className={`text-xs font-semibold uppercase tracking-wider text-gold ${bn}`}>{tx.home.storyOfDay}</p>
            </div>
            <h3 className={`font-display text-base font-semibold text-text ${bn}`}>
              {lang === "bn" ? story.titleBn : story.titleEn || story.titleBn}
            </h3>
            <p className={`mt-1 line-clamp-2 text-sm leading-relaxed text-text-soft ${bn}`}>
              {lang === "bn" ? story.bodyBn : story.bodyEn || story.bodyBn}
            </p>
            {story.source && <p className="mt-2 text-xs font-medium text-muted">{story.source}</p>}
          </Card>
        </Link>
      )}
    </div>
  );
}
