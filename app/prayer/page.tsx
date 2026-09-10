"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { usePrayerData, useCountdown } from "@/lib/use-prayer";
import { CALC_METHODS } from "@/lib/aladhan";
import { CITIES, type Place } from "@/lib/geo";
import PrayerTimesRow from "@/components/PrayerTimesRow";
import PrayerTracker from "@/components/PrayerTracker";
import PrayerReminders from "@/components/PrayerReminders";
import Icon from "@/components/Icon";
import { Button, Card, ErrorState, PageHeader, Sheet, Skeleton } from "@/components/ui";

export default function PrayerPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].prayer;
  const { place, setPlace, method, setMethod, times, loading, error, locating, detect, reload } = usePrayerData();
  const { next } = useCountdown(times);
  const [cityOpen, setCityOpen] = useState(false);

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Location + method controls */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold/15 text-gold">
            <Icon name="location" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-xs text-muted ${bn}`}>{tx.location}</p>
            <p className="truncate font-medium text-text">{place?.city ?? "-"}</p>
          </div>
          <button onClick={() => setCityOpen(true)} className={`text-sm font-medium text-gold ${bn}`}>
            {tx.changeCity}
          </button>
        </Card>

        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-jade/15 text-jade">
            <Icon name="clock" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <label className={`text-xs text-muted ${bn}`}>{tx.method}</label>
            <select
              value={method}
              onChange={(e) => setMethod(Number(e.target.value))}
              className="mt-0.5 w-full truncate bg-transparent text-sm font-medium text-text outline-none"
            >
              {CALC_METHODS.map((m) => (
                <option key={m.id} value={m.id} className="bg-surface text-text">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      </div>

      <Button variant="outline" className="mb-5 w-full py-3 text-sm" loading={locating} onClick={detect}>
        {!locating && <Icon name="location" size={16} />}
        <span className={bn}>{tx.useMyLocation}</span>
      </Button>

      {/* Schedule */}
      {loading && !times ? (
        <Skeleton className="h-80 w-full" />
      ) : error && !times ? (
        <ErrorState message={error} onRetry={reload} retryLabel={t[lang].common.retry} />
      ) : times ? (
        <PrayerTimesRow timings={times.timings} nextKey={next?.key} variant="list" />
      ) : null}

      {error && times && <p className={`mt-3 text-center text-xs text-muted ${bn}`}>{tx.locationDenied}</p>}

      {/* Prayer tracker (premium) */}
      <section className="mt-8">
        <h2 className={`mb-3 font-display text-lg font-semibold text-text ${bn}`}>{t[lang].tracker.title}</h2>
        <PrayerTracker />
      </section>

      {/* Reminders (premium) */}
      <section className="mt-8">
        <h2 className={`mb-3 font-display text-lg font-semibold text-text ${bn}`}>{t[lang].reminders.title}</h2>
        <PrayerReminders place={place} method={method} />
      </section>

      {/* City picker */}
      <Sheet open={cityOpen} onClose={() => setCityOpen(false)}>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`font-display text-lg font-semibold ${bn}`}>{tx.changeCity}</h2>
            <button onClick={() => setCityOpen(false)} className="text-muted hover:text-text" aria-label="Close">
              <Icon name="x" size={20} />
            </button>
          </div>
          <div className="max-h-[60vh] space-y-1 overflow-y-auto">
            {CITIES.map((c: Place) => (
              <button
                key={c.id}
                onClick={() => { setPlace(c); setCityOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-card-hi ${
                  place?.id === c.id ? "bg-card text-gold" : "text-text-soft"
                }`}
              >
                <Icon name="location" size={16} />
                <span className="font-medium">{c.city}</span>
                <span className="text-xs text-muted">{c.country}</span>
                {place?.id === c.id && <Icon name="check" size={16} className="ml-auto text-gold" />}
              </button>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  );
}
