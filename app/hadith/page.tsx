"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { COLLECTIONS, getHadith, type Hadith } from "@/lib/hadith";
import Icon from "@/components/Icon";
import { Button, Card, PageHeader, Skeleton } from "@/components/ui";

export default function HadithPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].hadith;

  const [collectionId, setCollectionId] = useState(COLLECTIONS[0].id);
  const [number, setNumber] = useState(1);
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(false);

  const collection = COLLECTIONS.find((c) => c.id === collectionId)!;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getHadith(collection, number)
      .then((h) => !cancelled && setHadith(h))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [collectionId, number]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (n: number) => setNumber(Math.min(Math.max(1, n), collection.total));
  const random = () => setNumber(Math.floor(Math.random() * collection.total) + 1);

  const onCollectionChange = (id: string) => {
    setCollectionId(id);
    setNumber(1);
  };

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Collection selector */}
      <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => onCollectionChange(c.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              c.id === collectionId ? "border-gold bg-gold text-on-gold" : "border-border bg-card text-text-soft hover:bg-card-hi"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Hadith card */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2">
            <Icon name="scroll" size={16} className="text-gold" />
            <span className="text-sm font-medium text-text">{collection.name}</span>
          </div>
          <span className={`text-xs text-muted ${bn}`}>{tx.number} {number}</span>
        </div>
        <div className="px-5 py-6">
          {loading || !hadith ? (
            <div className="space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              <p className="text-[15px] leading-relaxed text-text">{hadith.text}</p>
              {hadith.translationBn && lang === "bn" && (
                <p className="font-bn mt-4 border-t border-border pt-4 text-[15px] leading-relaxed text-text-soft">
                  {hadith.translationBn}
                </p>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Navigator */}
      <div className="mt-5 flex items-center gap-3">
        <Button variant="outline" className="flex-1 py-3" disabled={number <= 1} onClick={() => go(number - 1)}>
          <Icon name="chevron-left" size={18} />
          <span className={bn}>{tx.prev}</span>
        </Button>
        <Button variant="jade" className="py-3" onClick={random} aria-label={tx.random}>
          <Icon name="refresh" size={18} />
        </Button>
        <Button variant="outline" className="flex-1 py-3" disabled={number >= collection.total} onClick={() => go(number + 1)}>
          <span className={bn}>{tx.next}</span>
          <Icon name="chevron-right" size={18} />
        </Button>
      </div>
    </div>
  );
}
