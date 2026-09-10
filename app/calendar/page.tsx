"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { getMonthCalendar, loadMethod, type CalendarDay } from "@/lib/aladhan";
import { loadPlace } from "@/lib/geo";
import { hijriMonth, localeDigits } from "@/lib/hijri";
import Icon from "@/components/Icon";
import { Card, PageHeader, Skeleton, useMounted } from "@/components/ui";

const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  bn: ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহঃ", "শুক্র", "শনি"],
};
const GMONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
};

export default function CalendarPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].calendar;
  const mounted = useMounted();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [days, setDays] = useState<CalendarDay[] | null>(null);

  useEffect(() => {
    if (!mounted) return;
    setDays(null);
    getMonthCalendar(loadPlace(), loadMethod(), year, month)
      .then(setDays)
      .catch(() => setDays([]));
  }, [year, month, mounted]);

  const byDay = useMemo(() => {
    const map = new Map<number, CalendarDay>();
    days?.forEach((d) => map.set(d.gregorianDay, d));
    return map;
  }, [days]);

  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  const holidays = useMemo(
    () => (days ?? []).filter((d) => d.holidays.length > 0),
    [days]
  );

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const hijriLabel = days?.[14] ? hijriMonth(days[14].hijriMonthNumber, lang) : "";

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      <Card className="overflow-hidden">
        {/* Month header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button onClick={() => shift(-1)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-card-hi hover:text-text" aria-label={tx.prev}>
            <Icon name="chevron-left" size={20} />
          </button>
          <div className="text-center">
            <p className={`font-display text-lg font-semibold text-text ${bn}`}>
              {GMONTHS[lang][month - 1]} {localeDigits(year, lang)}
            </p>
            {hijriLabel && <p className={`text-xs text-gold ${bn}`}>{hijriLabel}</p>}
          </div>
          <button onClick={() => shift(1)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-card-hi hover:text-text" aria-label={tx.next}>
            <Icon name="chevron-right" size={20} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-3">
          <div className="mb-1 grid grid-cols-7 text-center">
            {WEEKDAYS[lang].map((w) => (
              <span key={w} className={`py-1 text-[11px] font-semibold text-muted ${bn}`}>{w}</span>
            ))}
          </div>
          {!days ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstWeekday }).map((_, i) => (
                <span key={`b${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const g = i + 1;
                const entry = byDay.get(g);
                const isToday = isCurrentMonth && g === today.getDate();
                const isHoliday = (entry?.holidays.length ?? 0) > 0;
                return (
                  <div
                    key={g}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-center ${
                      isToday
                        ? "border-gold bg-gold/15"
                        : isHoliday
                          ? "border-jade/40 bg-jade/5"
                          : "border-transparent"
                    }`}
                  >
                    <span className={`text-sm font-semibold ${isToday ? "text-gold" : "text-text"}`}>{localeDigits(g, lang)}</span>
                    {entry && <span className="text-[10px] text-muted tabular-nums">{localeDigits(entry.hijriDay, lang)}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Notable days */}
      {holidays.length > 0 && (
        <section className="mt-5">
          <h2 className={`mb-3 font-display text-lg font-semibold text-text ${bn}`}>{tx.events}</h2>
          <div className="space-y-2">
            {holidays.map((d) => (
              <Card key={d.gregorianDay} className="flex items-center gap-3 p-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-jade/15 text-center text-jade">
                  <span className="text-sm font-semibold">{localeDigits(d.gregorianDay, lang)}</span>
                </span>
                <div>
                  {d.holidays.map((h) => (
                    <p key={h} className="text-sm font-medium text-text">{h}</p>
                  ))}
                  <p className={`text-xs text-muted ${bn}`}>
                    {localeDigits(d.hijriDay, lang)} {hijriMonth(d.hijriMonthNumber, lang)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
