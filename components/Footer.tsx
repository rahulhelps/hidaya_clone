"use client";

import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";

function GirihMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className="text-gold">
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

/** Marketing footer for the login/landing page - mirrors ThinkFast's footer. */
export default function Footer() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <GirihMark size={30} />
              <span className={`font-display text-lg font-semibold tracking-tight text-text ${bn}`}>
                {t[lang].appName}
              </span>
            </div>
            <p className={`max-w-sm text-sm leading-relaxed text-muted ${bn}`}>{tx.tagline}</p>
          </div>

          {/* Quick links */}
          <div className="sm:justify-self-end">
            <h4 className={`mb-3 text-sm font-semibold text-text ${bn}`}>{tx.quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className={`text-sm text-muted transition-colors hover:text-gold ${bn}`}>
                  {tx.linkFeatures}
                </a>
              </li>
              <li>
                <a href="#subscribe" className={`text-sm text-muted transition-colors hover:text-gold ${bn}`}>
                  {tx.linkSubscribe}
                </a>
              </li>
              <li>
                <a href="/terms" className={`text-sm text-muted transition-colors hover:text-gold ${bn}`}>
                  {lang === "bn" ? "শর্তাবলী" : "Terms & Conditions"}
                </a>
              </li>
              <li>
                <a href="/privacy" className={`text-sm text-muted transition-colors hover:text-gold ${bn}`}>
                  {lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-center sm:flex-row sm:text-left">
          <p className={`text-xs text-muted ${bn}`}>{tx.copyright(year)}</p>
          <p className={`text-xs text-muted ${bn}`}>{tx.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
