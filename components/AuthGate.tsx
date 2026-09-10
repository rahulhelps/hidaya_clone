"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import t from "@/lib/translations";
import { isActive, onChange, refresh } from "@/lib/subscription";
import Icon, { type IconName } from "./Icon";
import { Card } from "./ui";
import ActivationForm from "./ActivationForm";
import Footer from "./Footer";

/** Legal pages are public - reachable without a subscription/login. */
const isPublicLegal = (p: string) => p === "/terms" || p === "/privacy";

/**
 * App-wide login/subscription wall - mirrors ThinkFast's marketing-then-subscribe
 * landing. Nothing in the app renders without an authenticated session, and since
 * login *is* subscription (see lib/subscription.ts), being logged in means being
 * subscribed. The OTP flow saves a session, which fires `hidayah-auth-change`,
 * flipping this gate so the full app appears.
 */
export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => setAuthed(isActive());
    sync();
    setReady(true);
    void refresh(); // confirm the carrier subscription is still live
    return onChange(sync);
  }, []);

  // Terms & Privacy are public - render them without the subscription wall.
  if (isPublicLegal(pathname)) return <>{children}</>;
  if (!ready) return <Splash />;
  if (authed) return <>{children}</>;
  return <Landing />;
}

function GirihMark({ size = 40, className = "text-gold" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <path
        d="M16 1.5 20 6l5.5-1L24.5 10.5 30 14l-5.5 3.5 1 5.5L20 22l-4 4.5L12 22l-5.5 1 1-5.5L2 14l5.5-3.5L6.5 5 12 6z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M16 5 18.4 9.6 23.6 8.4 22.4 13.6 27 16l-4.6 2.4 1.2 5.2L18.4 22.4 16 27l-2.4-4.6L8.4 23.6l1.2-5.2L5 16l4.6-2.4L8.4 8.4l5.2 1.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

/** Brief logo splash while we read the session from localStorage on mount. */
function Splash() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  return (
    <div className="grid min-h-dvh place-items-center bg-bg">
      <div className="flex flex-col items-center gap-3 fade-up">
        <span className="animate-pulse">
          <GirihMark size={48} />
        </span>
        <p className={`text-sm text-muted ${bn}`}>{t[lang].welcome.loading}</p>
      </div>
    </div>
  );
}

/** Marketing landing + OTP subscribe. Shown until the user is signed in. */
function Landing() {
  const { lang, toggle } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang];
  const w = tx.welcome;
  // Mirror ActivationForm's internal step so the left rail can highlight live.
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const activeIndex = { phone: 0, otp: 1, success: 2 }[step];

  return (
    <div className="min-h-dvh bg-bg">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-2.5">
            <GirihMark size={32} />
            <span className={`font-display text-xl font-semibold tracking-tight text-text ${bn}`}>
              {tx.appName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-soft transition-colors hover:bg-card-hi hover:text-gold"
              aria-label="Switch language"
              title="EN / বাংলা"
            >
              <span className="text-[11px] font-bold tracking-tight">{lang === "en" ? "বাং" : "EN"}</span>
            </button>
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-soft transition-colors hover:bg-card-hi hover:text-gold"
              aria-label="Toggle theme"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
            </button>
            <a
              href="#subscribe"
              className={`rounded-full bg-gold px-4 py-2 text-sm font-semibold text-on-gold transition hover:brightness-110 ${bn}`}
            >
              {tx.account.subscribe}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        {/* ── Hero ── */}
        <section className="fade-up relative overflow-hidden rounded-[2.25rem] border border-white/10 shadow-[0_44px_120px_-48px_rgba(0,0,0,0.75)]">
          {/* dawn-sky backdrop */}
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(135%_135%_at_50%_-25%,#36796d_0%,#245b53_45%,#173f3a_100%)]" />
          {/* girih star texture */}
          <div aria-hidden className="girih-bg absolute inset-0 opacity-[0.14]" />
          {/* warm gold horizon glow */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-28 h-96 bg-[radial-gradient(50%_70%_at_50%_0%,rgba(236,205,138,0.32),transparent)]" />
          {/* bottom depth */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:px-10 sm:py-28">
            <span className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-[#eccd8a]/25 bg-white/[0.06] shadow-[0_0_55px_-12px_rgba(236,205,138,0.65)] backdrop-blur-sm">
              <GirihMark size={40} className="text-[#eccd8a]" />
            </span>
            <span
              className={`inline-block rounded-full border border-[#eccd8a]/35 bg-white/[0.05] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#eccd8a] ${bn}`}
            >
              {w.badge}
            </span>
            <h1 className={`mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-[#f6efe0] sm:text-[3.25rem] ${bn}`}>
              {w.heroTitle}
            </h1>
            <p className={`mt-5 max-w-lg text-base leading-relaxed text-[#cfd8cf] sm:text-lg ${bn}`}>{w.heroSubtitle}</p>
            <a
              href="#subscribe"
              className={`group mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-[#d7b262] px-9 py-4 text-base font-semibold text-[#1a1206] shadow-[0_18px_44px_-14px_rgba(236,205,138,0.75)] transition hover:brightness-105 ${bn}`}
            >
              {tx.premium.cta}
              <Icon name="arrow-right" size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            {/* charge - single, highlighted pill so the price is clearly visible */}
            <p className={`mt-6 inline-flex items-center gap-2 rounded-full border border-[#eccd8a]/40 bg-white/[0.07] px-4 py-2 text-xs font-semibold text-[#eccd8a] backdrop-blur-sm ${bn}`}>
              <Icon name="star" size={14} className="shrink-0" />
              <span>{tx.premium.chargeNote}</span>
            </p>
          </div>
        </section>

        {/* ── Feature grid (marketing) ── */}
        <section id="features" className="mt-16 scroll-mt-20">
          <h2 className={`mb-2 text-center font-display text-2xl font-semibold text-text sm:text-3xl ${bn}`}>
            {w.featuresHeading}
          </h2>
          <div aria-hidden className="rule-diamond mx-auto mb-8 max-w-xs">
            <GirihMark size={16} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {w.features.map((f) => (
              <Card key={f.title} className="flex items-start gap-4 p-5 transition-colors hover:bg-card-hi">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                  <Icon name={f.icon as IconName} size={22} />
                </span>
                <div>
                  <h3 className={`font-display text-base font-semibold text-text ${bn}`}>{f.title}</h3>
                  <p className={`mt-1 text-sm leading-relaxed text-text-soft ${bn}`}>{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Subscribe ── */}
        <section id="subscribe" className="mt-20 scroll-mt-20">
          <div className="mb-9 text-center">
            <h2 className={`font-display text-2xl font-semibold text-text sm:text-3xl ${bn}`}>{w.subscribeHeading}</h2>
            <p className={`mx-auto mt-2 max-w-md text-sm text-text-soft ${bn}`}>{w.subscribeSubtitle}</p>
          </div>

          <div className="mx-auto grid max-w-4xl items-start gap-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-12">
            {/* Step rail - reflects the form's current step */}
            <ol className="md:pt-2">
              {w.steps.map((s, i) => {
                const done = i < activeIndex;
                const active = i === activeIndex;
                const last = i === w.steps.length - 1;
                return (
                  <li key={s.title} className={`relative flex gap-4 ${last ? "" : "pb-7"}`}>
                    {!last && (
                      <span
                        aria-hidden
                        className={`absolute left-[18px] top-10 bottom-0 w-px -translate-x-1/2 transition-colors ${
                          done ? "bg-gold" : "bg-border-strong"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${
                        active
                          ? "border-gold bg-gold text-on-gold shadow-[0_0_0_4px_rgba(215,178,98,0.18)]"
                          : done
                            ? "border-gold/60 bg-gold/15 text-gold"
                            : "border-border-strong bg-card text-muted"
                      }`}
                    >
                      {done ? <Icon name="check" size={16} /> : i + 1}
                    </span>
                    <div className="pt-1">
                      <h3 className={`font-display text-base font-semibold ${active || done ? "text-text" : "text-muted"} ${bn}`}>
                        {s.title}
                      </h3>
                      <p className={`mt-0.5 text-sm leading-relaxed ${active ? "text-text-soft" : "text-muted"} ${bn}`}>
                        {s.desc}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Form - saving the session flips AuthGate, revealing the app. */}
            <Card className="overflow-hidden">
              <ActivationForm onStep={setStep} hideSteps />
            </Card>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
