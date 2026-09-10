"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { FARD, type Fard } from "@/lib/prayer-log";
import {
  loadReminders,
  saveReminders,
  permissionState,
  requestPermission,
  enablePush,
  syncPushSettings,
  disablePush,
  pushSupported,
  MINUTE_OPTIONS,
  type ReminderSettings,
} from "@/lib/reminders";
import { pushTest, type PushSettingsPayload } from "@/lib/api";
import type { Place } from "@/lib/geo";
import { usePremiumStatus, PremiumModal } from "@/components/PremiumGate";
import Icon from "./Icon";
import { Button, Card, Segmented } from "./ui";

export default function PrayerReminders({ place, method }: { place: Place | null; method: number }) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].reminders;
  const tp = t[lang].prayer;
  const premium = usePremiumStatus();

  const [settings, setSettings] = useState<ReminderSettings>(loadReminders);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [busy, setBusy] = useState(false);
  const [upsell, setUpsell] = useState(false);

  useEffect(() => {
    setSettings(loadReminders());
    setPerm(pushSupported() ? permissionState() : "unsupported");
  }, []);

  const payload = (enabled: boolean, s: ReminderSettings): PushSettingsPayload => ({
    enabled,
    minutesBefore: s.minutesBefore,
    prayers: s.prayers,
    latitude: place?.lat ?? null,
    longitude: place?.lng ?? null,
    method,
    tzOffsetMinutes: -new Date().getTimezoneOffset(),
    lang,
  });

  const persist = (s: ReminderSettings) => {
    setSettings(s);
    saveReminders(s);
  };

  const enableFlow = async () => {
    setBusy(true);
    try {
      if (perm !== "granted") {
        const res = await requestPermission();
        setPerm(res);
        if (res !== "granted") return;
      }
      const ok = await enablePush(payload(true, settings));
      if (ok) persist({ ...settings, enabled: true });
    } catch {
      /* surfaced via perm/unsupported states */
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    try {
      await disablePush();
      persist({ ...settings, enabled: false });
    } finally {
      setBusy(false);
    }
  };

  // When a setting changes while enabled, push the new config to the backend.
  const change = (s: ReminderSettings) => {
    persist(s);
    if (s.enabled && perm === "granted") void syncPushSettings(payload(true, s));
  };

  if (!premium) {
    return (
      <Card className="overflow-hidden">
        <div className="atmo girih-bg px-6 py-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-gold/40 bg-card text-gold">
            <Icon name="clock" size={26} />
          </div>
          <h3 className={`font-display text-xl font-semibold text-white ${bn}`}>{tx.title}</h3>
          <p className={`mx-auto mt-2 max-w-xs text-sm text-white/70 ${bn}`}>{tx.subtitle}</p>
          <Button className="mt-5 px-6 py-3" onClick={() => setUpsell(true)}>
            <Icon name="star" size={18} />
            <span className={bn}>{t[lang].account.subscribe}</span>
          </Button>
        </div>
        <PremiumModal open={upsell} onClose={() => setUpsell(false)} />
      </Card>
    );
  }

  if (perm === "unsupported") {
    return (
      <Card className="p-5">
        <p className={`text-sm text-muted ${bn}`}>{tx.denied}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border p-5">
        <div className="min-w-0">
          <p className={`font-medium text-text ${bn}`}>{tx.enable}</p>
          <p className={`text-xs text-muted ${bn}`}>{tx.subtitle}</p>
        </div>
        {perm === "denied" ? (
          <span className={`max-w-[160px] text-right text-xs text-muted ${bn}`}>{tx.denied}</span>
        ) : !settings.enabled ? (
          <Button className="shrink-0 px-4 py-2 text-sm" loading={busy} onClick={enableFlow}>
            <span className={bn}>{perm === "granted" ? tx.on : tx.permission}</span>
          </Button>
        ) : (
          <Toggle on onClick={turnOff} />
        )}
      </div>

      {settings.enabled && (
        <div className="p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <span className={`text-sm font-medium text-text-soft ${bn}`}>{tx.minutesBefore}</span>
            <Segmented<string>
              value={String(settings.minutesBefore)}
              onChange={(v) => change({ ...settings, minutesBefore: Number(v) })}
              options={MINUTE_OPTIONS.map((m) => ({ value: String(m), label: tx.min(m) }))}
            />
          </div>

          <div className="space-y-1.5">
            {FARD.map((p: Fard) => (
              <div key={p} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
                <span className={`text-sm text-text ${bn}`}>{tp[p.toLowerCase() as keyof typeof tp]}</span>
                <Toggle
                  on={settings.prayers[p]}
                  onClick={() => change({ ...settings, prayers: { ...settings.prayers, [p]: !settings.prayers[p] } })}
                />
              </div>
            ))}
          </div>

          <p className={`mt-4 text-xs text-muted ${bn}`}>{tx.bgNote}</p>
          <Button
            variant="outline"
            className="mt-3 w-full py-2.5 text-sm"
            onClick={() => void pushTest().catch(() => {})}
          >
            <Icon name="clock" size={16} />
            <span className={bn}>{tx.test}</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-gold" : "bg-border-strong"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card transition-transform ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}
