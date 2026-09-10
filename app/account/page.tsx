"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import t from "@/lib/translations";
import { loadAuth } from "@/lib/auth-store";
import { deactivate, logout } from "@/lib/subscription";
import { unsubscribeUser } from "@/lib/api";
import { usePremiumStatus, PremiumModal } from "@/components/PremiumGate";
import Icon from "@/components/Icon";
import { Button, Card, PageHeader, Segmented, Sheet, Spinner, useMounted } from "@/components/ui";

export default function AccountPage() {
  const { lang, setLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].account;
  const mounted = useMounted();
  const premium = usePremiumStatus();

  const [phone, setPhone] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Unsubscribe confirmation flow - mirrors ThinkFast: confirm → loading →
  // outcome (success / nothing-to-cancel) with error handling.
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [unsubLoading, setUnsubLoading] = useState(false);
  const [unsubError, setUnsubError] = useState("");
  const [unsubDone, setUnsubDone] = useState<null | "success" | "none">(null);

  useEffect(() => {
    if (mounted) setPhone(loadAuth()?.phoneNumber ?? null);
  }, [mounted, premium]);

  const openConfirm = () => {
    setUnsubError("");
    setUnsubDone(null);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (unsubLoading) return; // don't dismiss mid-request
    setConfirmOpen(false);
    setUnsubError("");
    setUnsubDone(null);
  };

  const confirmUnsubscribe = async () => {
    setUnsubError("");
    setUnsubLoading(true);
    try {
      const res = await unsubscribeUser();
      deactivate();
      setPhone(null);
      setUnsubLoading(false);
      setUnsubDone(res.alreadyUnsubscribed ? "none" : "success");
    } catch (err) {
      const status = (err as { status?: number }).status;
      setUnsubError(status === 401 ? tx.unsubscribeSessionExpired : tx.unsubscribeGenericError);
      setUnsubLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      {/* Subscription */}
      <Card className="mb-5 overflow-hidden">
        <div className="atmo girih-bg px-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl border ${premium ? "border-gold/50 bg-gold/15 text-gold" : "border-white/15 bg-black/20 text-white/70"}`}>
                <Icon name="star" size={24} />
              </span>
              <div>
                <p className={`font-display text-lg font-semibold text-white ${bn}`}>{tx.subscription}</p>
                <p className={`text-sm ${premium ? "text-gold" : "text-white/60"} ${bn}`}>
                  {premium ? tx.active : tx.inactive}
                </p>
              </div>
            </div>
            {premium && <Icon name="check" size={22} className="text-jade" />}
          </div>

          {phone && (
            <p className={`mt-4 text-sm text-white/70 ${bn}`}>
              {tx.signedInAs} <span className="font-semibold text-white">+88 {phone}</span>
            </p>
          )}
          {!premium && <p className={`mt-3 text-sm text-white/60 ${bn}`}>{tx.notSignedIn}</p>}
        </div>

        <div className="px-5 py-4">
          {premium ? (
            <Button variant="outline" className="w-full py-3" onClick={openConfirm}>
              <span className={bn}>{tx.unsubscribe}</span>
            </Button>
          ) : (
            <Button className="w-full py-3.5" onClick={() => setModalOpen(true)}>
              <Icon name="star" size={18} />
              <span className={bn}>{tx.subscribe}</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Preferences */}
      <Card className="divide-y divide-border">
        <Row icon="globe" label={tx.language} bn={bn}>
          <Segmented
            value={lang}
            onChange={(v) => setLang(v)}
            options={[
              { value: "bn", label: "বাংলা" },
              { value: "en", label: "EN" },
            ]}
          />
        </Row>
        <Row icon={theme === "dark" ? "moon" : "sun"} label={tx.theme} bn={bn}>
          <Segmented
            value={theme}
            onChange={(v) => setTheme(v)}
            options={[
              { value: "dark", label: tx.dark },
              { value: "light", label: tx.light },
            ]}
          />
        </Row>
      </Card>

      {/* Log out - clears this device's session but keeps the subscription. */}
      <Button variant="outline" className="mt-5 w-full py-3" onClick={() => logout()}>
        <Icon name="arrow-right" size={18} />
        <span className={bn}>{tx.logout}</span>
      </Button>
      <p className={`mt-2 text-center text-xs text-muted ${bn}`}>{tx.logoutHint}</p>

      <p className="mt-6 text-center text-xs text-muted">
        {t[lang].appName} · {t[lang].tagline}
      </p>

      <PremiumModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Unsubscribe confirmation / outcome dialog */}
      <Sheet open={confirmOpen} onClose={closeConfirm}>
        <div className="p-6 sm:p-7">
          {unsubDone ? (
            <div className="text-center">
              <div
                className={`mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full ${
                  unsubDone === "success" ? "bg-jade/15 text-jade" : "bg-white/10 text-white/70"
                }`}
              >
                <Icon name={unsubDone === "success" ? "check" : "star"} size={26} />
              </div>
              <h3 className={`font-display text-xl font-semibold text-text ${bn}`}>
                {unsubDone === "success" ? tx.unsubscribeDoneTitle : tx.unsubscribeNoneTitle}
              </h3>
              <p className={`mt-2 text-sm text-muted ${bn}`}>
                {unsubDone === "success" ? tx.unsubscribeDoneMsg : tx.unsubscribeNoneMsg}
              </p>
              <Button className="mt-6 w-full py-3" onClick={closeConfirm}>
                <span className={bn}>{tx.unsubscribeDoneBtn}</span>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-red-500/15 text-red-400">
                <Icon name="star" size={26} />
              </div>
              <h3 className={`font-display text-xl font-semibold text-text ${bn}`}>{tx.unsubscribeConfirmTitle}</h3>
              <p className={`mt-2 text-sm text-muted ${bn}`}>{tx.unsubscribeConfirmMsg}</p>

              {unsubError && (
                <div className={`mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 ${bn}`}>
                  {unsubError}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full py-3 border-red-500/40 text-red-400 hover:bg-red-500/10"
                  disabled={unsubLoading}
                  onClick={confirmUnsubscribe}
                >
                  {unsubLoading && <Spinner className="w-4 h-4" />}
                  <span className={bn}>{unsubLoading ? tx.unsubscribing : tx.unsubscribeConfirm}</span>
                </Button>
                <Button variant="ghost" className="w-full py-3" disabled={unsubLoading} onClick={closeConfirm}>
                  <span className={bn}>{tx.unsubscribeCancel}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Sheet>
    </div>
  );
}

function Row({
  icon,
  label,
  bn,
  children,
}: {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  bn: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-surface text-gold">
          <Icon name={icon} size={18} />
        </span>
        <span className={`font-medium text-text ${bn}`}>{label}</span>
      </div>
      {children}
    </div>
  );
}
