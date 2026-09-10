"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import t from "@/lib/translations";
import Icon, { type IconName } from "./Icon";
import { Sheet } from "./ui";
import Footer from "./Footer";

type NavItem = { href: string; key: keyof (typeof t)["en"]["nav"]; icon: IconName };

// The mobile bar is grid-cols-5 (4 primary + "More"), so a 5th primary item
// means swapping rather than adding: at 375px a 6th cell drops each to ~62px,
// and the Bangla labels already run long. Chat takes the centre slot (best
// thumb reach) and qibla moves down - qibla is a situational one-shot utility,
// duas is daily-use content.
const PRIMARY: NavItem[] = [
  { href: "/", key: "home", icon: "home" },
  { href: "/quran", key: "quran", icon: "book" },
  { href: "/chat", key: "chat", icon: "chat" },
  { href: "/duas", key: "duas", icon: "hands" },
];

const SECONDARY: NavItem[] = [
  { href: "/prayer", key: "prayer", icon: "clock" },
  { href: "/qibla", key: "qibla", icon: "compass" },
  { href: "/names", key: "names", icon: "sparkle" },
  { href: "/tasbih", key: "tasbih", icon: "beads" },
  { href: "/calendar", key: "calendar", icon: "calendar" },
  { href: "/hadith", key: "hadith", icon: "scroll" },
  { href: "/story", key: "story", icon: "feather" },
  { href: "/bookmarks", key: "bookmarks", icon: "star" },
  { href: "/account", key: "account", icon: "user" },
];

function Logo({ withWord = true }: { withWord?: boolean }) {
  const { lang } = useLanguage();
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="Hidayah home">
      <span className="relative grid place-items-center">
        <svg width="34" height="34" viewBox="0 0 32 32" className="text-gold transition-transform group-hover:rotate-45 duration-500">
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
      </span>
      {withWord && (
        <span
          className={`font-display text-xl font-semibold tracking-tight text-text ${lang === "bn" ? "font-bn" : ""}`}
        >
          {t[lang].appName}
        </span>
      )}
    </Link>
  );
}

function Toggles() {
  const { lang, toggle } = useLanguage();
  const { theme, toggle: toggleTheme } = useTheme();
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggle}
        className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-soft hover:bg-card-hi hover:text-gold transition-colors"
        aria-label="Switch language"
        title="EN / বাংলা"
      >
        <span className="text-[11px] font-bold tracking-tight">{lang === "en" ? "বাং" : "EN"}</span>
      </button>
      <button
        onClick={toggleTheme}
        className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-soft hover:bg-card-hi hover:text-gold transition-colors"
        aria-label="Toggle theme"
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={17} />
      </button>
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);
  const tx = t[lang].nav;
  const bn = lang === "bn" ? "font-bn" : "";

  // Legal pages render standalone (their own header/footer) - no app chrome.
  if (pathname === "/terms" || pathname === "/privacy") return <>{children}</>;

  const allItems = [...PRIMARY, ...SECONDARY];

  // Chat needs the app-shell model - fixed header, internally scrolling
  // transcript, pinned composer - rather than the document scroll every other
  // page uses. `min-h-0` on each flex ancestor is load-bearing: without it the
  // overflow-y-auto child grows instead of scrolling.
  const fullHeight = pathname.startsWith("/chat");

  return (
    <div
      className={`lg:grid lg:grid-cols-[260px_1fr] ${
        fullHeight ? "h-dvh overflow-hidden" : "min-h-dvh"
      }`}
    >
      {/* ── Desktop left rail ── */}
      <aside className="hidden lg:flex sticky top-0 h-dvh flex-col border-r border-border bg-surface/60 backdrop-blur px-5 py-7">
        <Logo />
        <nav className="mt-9 flex flex-1 flex-col gap-1">
          {allItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-card text-gold" : "text-text-soft hover:bg-card-hi hover:text-text"
                } ${bn}`}
              >
                <span
                  className={`transition-colors ${active ? "text-gold" : "text-muted group-hover:text-gold"}`}
                >
                  <Icon name={item.icon} size={20} />
                </span>
                {tx[item.key]}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-5">
          <span className={`text-xs text-muted ${bn}`}>{t[lang].tagline}</span>
          <Toggles />
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className={`flex min-w-0 flex-col ${fullHeight ? "h-dvh min-h-0" : ""}`}>
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/85 px-4 py-3 backdrop-blur">
          <Logo />
          <Toggles />
        </header>

        <main
          className={
            fullHeight
              ? "flex min-h-0 flex-1 flex-col overflow-hidden px-0 pt-0 lg:px-10 lg:pt-6"
              : "flex-1 px-4 pt-5 sm:px-6 lg:px-10 lg:pt-9"
          }
        >
          <div
            className={
              fullHeight
                ? "mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col"
                : "mx-auto w-full max-w-3xl"
            }
          >
            {children}
          </div>
        </main>

        {/* Footer is part of the app chrome too, so it stays visible after login.
            Extra bottom padding on mobile clears the fixed bottom nav.
            Full-height routes own their whole viewport, so they skip it. */}
        {!fullHeight && (
          <div className="pb-24 lg:pb-0">
            <Footer />
          </div>
        )}
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-bg/90 backdrop-blur-lg">
        <div className="mx-auto grid max-w-md grid-cols-5 px-2 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
          {PRIMARY.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
                  active ? "text-gold" : "text-muted"
                } ${bn}`}
              >
                <Icon name={item.icon} size={22} />
                {tx[item.key]}
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium text-muted ${bn}`}
          >
            <Icon name="grid" size={22} />
            {tx.more}
          </button>
        </div>
      </nav>

      {/* ── "More" sheet (mobile) ── */}
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className={`font-display text-lg font-semibold ${bn}`}>{tx.more}</h2>
            <button onClick={() => setMoreOpen(false)} className="text-muted hover:text-text" aria-label="Close">
              <Icon name="x" size={20} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {SECONDARY.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border border-border p-4 text-xs font-medium transition-colors ${
                    active ? "bg-card text-gold" : "text-text-soft hover:bg-card-hi"
                  } ${bn}`}
                >
                  <Icon name={item.icon} size={24} />
                  {tx[item.key]}
                </Link>
              );
            })}
          </div>
        </div>
      </Sheet>
    </div>
  );
}
