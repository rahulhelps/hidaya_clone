"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import {
  getBookmarks,
  getLastRead,
  removeBookmark,
  onChange,
  type Bookmark,
  type LastRead,
} from "@/lib/bookmarks";
import { usePremiumStatus, PremiumModal } from "@/components/PremiumGate";
import Icon from "@/components/Icon";
import { Button, Card, PageHeader, useMounted } from "@/components/ui";

export default function BookmarksPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].bookmarks;
  const premium = usePremiumStatus();
  const mounted = useMounted();

  const [items, setItems] = useState<Bookmark[]>([]);
  const [lastRead, setLR] = useState<LastRead | null>(null);
  const [upsell, setUpsell] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const sync = () => {
      setItems(getBookmarks());
      setLR(getLastRead());
    };
    sync();
    return onChange(sync);
  }, [mounted]);

  if (!premium) {
    return (
      <div>
        <PageHeader title={tx.title} subtitle={tx.subtitle} />
        <Card className="overflow-hidden">
          <div className="atmo girih-bg px-6 py-10 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-card text-gold">
              <Icon name="lock" size={26} />
            </div>
            <h2 className={`font-display text-xl font-semibold text-white ${bn}`}>{tx.premiumTitle}</h2>
            <p className={`mx-auto mt-2 max-w-xs text-sm text-white/70 ${bn}`}>{tx.premiumBody}</p>
            <Button className="mt-6 px-6 py-3" onClick={() => setUpsell(true)}>
              <Icon name="star" size={18} />
              <span className={bn}>{t[lang].account.subscribe}</span>
            </Button>
          </div>
        </Card>
        <PremiumModal open={upsell} onClose={() => setUpsell(false)} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {lastRead && (
        <Link href={`/quran/${lastRead.surahId}`} className="mb-5 block">
          <Card className="flex items-center gap-3 p-4 transition-colors hover:border-gold/40 hover:bg-card-hi">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
              <Icon name="book" size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-xs text-muted ${bn}`}>{tx.continueReading}</p>
              <p className="truncate font-medium text-text">{lastRead.surahName}</p>
            </div>
            <Icon name="chevron-right" size={18} className="text-muted" />
          </Card>
        </Link>
      )}

      {items.length === 0 ? (
        <Card className="p-8 text-center">
          <Icon name="book" size={28} className="mx-auto mb-3 text-muted" />
          <p className={`text-sm text-muted ${bn}`}>{tx.empty}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <Card key={b.key} className="flex items-center gap-3 p-3.5">
              <Link href={`/quran/${b.surahId}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-xs font-semibold text-gold">
                  {b.surahId}:{b.ayah}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-text">{b.surahName}</p>
                  <p className="arabic truncate text-sm text-muted" style={{ direction: "rtl" }}>{b.text}</p>
                </div>
              </Link>
              <button onClick={() => removeBookmark(b.key)} className="shrink-0 text-muted hover:text-red-400" aria-label="Remove">
                <Icon name="x" size={18} />
              </button>
            </Card>
          ))}
        </div>
      )}
      <PremiumModal open={upsell} onClose={() => setUpsell(false)} />
    </div>
  );
}
