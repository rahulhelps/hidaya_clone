"use client";

import { useLanguage } from "@/context/LanguageContext";
import legal from "@/lib/legal";
import Footer from "./Footer";

function GirihMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="text-gold">
      <path
        d="M16 1.5 20 6l5.5-1L24.5 10.5 30 14l-5.5 3.5 1 5.5L20 22l-4 4.5L12 22l-5.5 1 1-5.5L2 14l5.5-3.5L6.5 5 12 6z"
        fill="currentColor"
        opacity="0.16"
      />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

/** Renders a Terms or Privacy document in Hidayah's editorial-nocturnal theme. */
export default function LegalPage({ doc }: { doc: "terms" | "privacy" }) {
  const { lang, toggle } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const content = legal[lang][doc];

  return (
    <div className="min-h-dvh bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/85 px-4 py-3 backdrop-blur sm:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="Hidayah - home">
          <GirihMark size={30} />
          <span className={`font-display text-xl font-semibold tracking-tight text-text ${bn}`}>
            {lang === "bn" ? "হিদায়াহ" : "Hidayah"}
          </span>
        </a>
        <button
          onClick={toggle}
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-text-soft transition-colors hover:bg-card-hi hover:text-gold"
          aria-label="Switch language"
          title="EN / বাংলা"
        >
          <span className="text-[11px] font-bold tracking-tight">{lang === "en" ? "বাং" : "EN"}</span>
        </button>
      </header>

      {/* Document */}
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <a
          href="/"
          className={`mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-gold ${bn}`}
        >
          ← {lang === "en" ? "Back to home" : "হোমে ফিরুন"}
        </a>

        <h1 className={`font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl ${bn}`}>
          {content.title}
        </h1>
        <p className={`mt-2 text-xs text-muted ${bn}`}>{content.updated}</p>
        <p className={`mt-6 text-sm leading-relaxed text-text-soft ${bn}`}>{content.intro}</p>

        <div className="mt-8 space-y-8">
          {content.sections.map((s) => (
            <section key={s.heading}>
              <h2 className={`font-display text-lg font-semibold text-text ${bn}`}>{s.heading}</h2>
              <div className="mt-2 space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className={`text-sm leading-relaxed text-text-soft ${bn}`}>
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
