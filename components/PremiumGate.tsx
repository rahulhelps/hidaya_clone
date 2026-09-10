"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { isActive, onChange, refresh } from "@/lib/subscription";
import Icon from "./Icon";
import { Sheet } from "./ui";
import ActivationForm from "./ActivationForm";

/** Live premium status. Re-renders on auth/subscription changes. */
export function usePremiumStatus() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const sync = () => setActive(isActive());
    sync();
    void refresh(); // confirm against backend (cross-device / session)
    return onChange(sync);
  }, []);
  return active;
}

/** The upsell sheet: feature pitch → OTP subscribe flow. */
export function PremiumModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].premium;
  const [showForm, setShowForm] = useState(false);

  // Reset to the pitch each time the sheet re-opens.
  useEffect(() => {
    if (open) setShowForm(false);
  }, [open]);

  const features = tx.features;

  return (
    <Sheet open={open} onClose={onClose}>
      {!showForm ? (
        <div className="overflow-hidden">
          <div className="atmo girih-bg relative px-6 pb-7 pt-8 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-card text-gold">
              <Icon name="star" size={26} />
            </div>
            <span className={`inline-block rounded-full border border-gold/40 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold ${bn}`}>
              {tx.badge}
            </span>
            <h2 className={`mt-3 font-display text-2xl font-semibold text-text ${bn}`}>{tx.title}</h2>
            <p className={`mx-auto mt-2 max-w-sm text-sm text-text-soft ${bn}`}>{tx.subtitle}</p>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-2.5">
              {features.map((f) => (
                <li key={f} className={`flex items-center gap-3 text-sm text-text-soft ${bn}`}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-jade/15 text-jade">
                    <Icon name="check" size={15} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowForm(true)}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold py-3.5 font-semibold text-on-gold transition hover:brightness-110 ${bn}`}
            >
              {tx.cta}
              <Icon name="arrow-right" size={18} />
            </button>
            <p className={`mt-3 text-center text-xs text-muted ${bn}`}>{tx.chargeNote}</p>
            <button onClick={onClose} className={`mt-3 w-full text-center text-sm text-muted hover:text-text ${bn}`}>
              {tx.maybeLater}
            </button>
          </div>
        </div>
      ) : (
        <ActivationForm onDone={onClose} />
      )}
    </Sheet>
  );
}

/**
 * Inline unlock chip - opens the premium sheet. Drop next to any premium action
 * (e.g. the Quran audio button). Renders nothing extra when already subscribed;
 * callers check `usePremiumStatus()` to decide which to show.
 */
export function UnlockChip({ label }: { label?: string }) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition hover:bg-gold/20 ${bn}`}
      >
        <Icon name="lock" size={14} />
        {label ?? t[lang].common.unlock}
      </button>
      <PremiumModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
