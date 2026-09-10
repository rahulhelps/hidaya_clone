"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { getStoryOfDay, type StoryOfDay } from "@/lib/api";
import Icon from "@/components/Icon";
import { Card, PageHeader, Skeleton } from "@/components/ui";

export default function StoryPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].story;

  const [story, setStory] = useState<StoryOfDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStoryOfDay()
      .then((s) => !cancelled && setStory(s))
      .catch(() => !cancelled && setStory(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const title = story && (lang === "bn" ? story.titleBn : story.titleEn || story.titleBn);
  const body = story && (lang === "bn" ? story.bodyBn : story.bodyEn || story.bodyBn);

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {loading ? (
        <Card className="space-y-3 p-6">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </Card>
      ) : story ? (
        <Card className="overflow-hidden">
          <div className="atmo girih-bg px-6 py-7">
            <div className="mb-2 flex items-center gap-2">
              <Icon name="book" size={16} className="text-gold" />
              <span className={`text-xs font-semibold uppercase tracking-wider text-gold ${bn}`}>
                {t[lang].home.storyOfDay}
              </span>
            </div>
            <h1 className={`font-display text-2xl font-semibold leading-tight text-text ${bn}`}>{title}</h1>
            {story.source && <p className={`mt-2 text-sm text-muted ${bn}`}>{story.source}</p>}
          </div>
          <div className="px-6 py-6">
            <p className={`whitespace-pre-line text-[15px] leading-relaxed text-text-soft ${bn}`}>{body}</p>
          </div>
        </Card>
      ) : (
        <Card className="px-6 py-12 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-border bg-card-hi text-muted">
            <Icon name="book" size={26} />
          </div>
          <h2 className={`font-display text-lg font-semibold text-text ${bn}`}>{tx.empty}</h2>
          <p className={`mx-auto mt-1.5 max-w-xs text-sm text-muted ${bn}`}>{tx.emptyHint}</p>
        </Card>
      )}
    </div>
  );
}
