"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import { useLanguage } from "@/context/LanguageContext";
import { localeDigits } from "@/lib/hijri";
import type { ChatQuota } from "@/lib/api";
import t from "@/lib/translations";
import { useMounted } from "@/components/ui";

const MAX_CHARS = 4000;
const COUNTER_FROM = 3600;
const MAX_HEIGHT = 160;

export default function Composer({
  disabled,
  pending,
  quota,
  restored,
  takeRestored,
  draftKey,
  onSend,
  onStop,
}: {
  disabled: boolean;
  pending: boolean;
  quota: ChatQuota | null;
  restored: string | null;
  takeRestored: () => string | null;
  draftKey: string;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const { lang } = useLanguage();
  const tx = t[lang].chat;
  const bn = lang === "bn" ? "font-bn" : "";
  const mounted = useMounted();

  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const hardwareKeyboard = useRef(false);

  useEffect(() => {
    hardwareKeyboard.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  // Restore a draft the browser may have evicted during a 25s wait.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) setValue(saved);
    } catch {
      /* private mode */
    }
  }, [draftKey]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (value) sessionStorage.setItem(draftKey, value);
        else sessionStorage.removeItem(draftKey);
      } catch {
        /* private mode */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [value, draftKey]);

  // Cancel / edit hands the text back to the composer.
  useEffect(() => {
    if (restored === null) return;
    const text = takeRestored();
    if (text) {
      setValue(text);
      const el = ref.current;
      if (el) {
        el.focus();
        requestAnimationFrame(() => el.setSelectionRange(text.length, text.length));
      }
    }
  }, [restored, takeRestored]);

  // Autosize fallback for engines without `field-sizing: content`. Runs on
  // every change so the box shrinks again on clear, not just grows.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || disabled || pending) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    // Bangla is the default language and Android IMEs fire Enter mid-
    // composition, so this guard is not optional.
    if (event.nativeEvent.isComposing) return;
    if (!hardwareKeyboard.current) return; // touch: Return makes a newline
    event.preventDefault();
    submit();
  };

  const exhausted = Boolean(quota && quota.remaining <= 0);
  const resetLabel =
    mounted && quota
      ? new Date(quota.resetsAt).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  return (
    <div className="shrink-0 border-t border-border bg-bg/95 px-4 pt-3 backdrop-blur pb-[calc(var(--nav-h)+env(safe-area-inset-bottom)+0.25rem)] sm:px-0 lg:pb-4">
      {exhausted ? (
        // A disabled control always comes with a visible reason.
        <div
          role="status"
          className={`rounded-2xl border border-gold/40 bg-card px-4 py-3 ${bn}`}
        >
          <p className="text-sm font-semibold text-text">{tx.quotaExhaustedTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-text-soft">{tx.quotaExhausted}</p>
          {resetLabel && (
            <p className="mt-1.5 text-xs text-muted">
              {tx.quotaResetsAt} {resetLabel}
            </p>
          )}
        </div>
      ) : (
        <>
          <label htmlFor="chat-input" className="sr-only">
            {tx.placeholder}
          </label>
          <div className="relative">
            <textarea
              id="chat-input"
              ref={ref}
              rows={1}
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={onKeyDown}
              placeholder={tx.placeholder}
              disabled={disabled}
              maxLength={MAX_CHARS}
              autoCapitalize="sentences"
              autoCorrect="on"
              aria-describedby="chat-quota"
              className={`field-sizing-content max-h-40 w-full resize-none overflow-y-auto rounded-2xl border border-border bg-card py-3 pl-4 pr-12 text-[15px] leading-relaxed text-text outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20 disabled:opacity-60 ${bn}`}
            />
            <button
              type="button"
              onClick={pending ? onStop : submit}
              disabled={!pending && (!value.trim() || disabled)}
              aria-label={pending ? tx.stop : tx.send}
              className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-gold text-on-gold transition disabled:opacity-40"
            >
              <Icon name={pending ? "stop" : "send"} size={17} />
            </button>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-3 px-1">
            <p id="chat-quota" className={`text-[11px] text-muted ${bn}`}>
              {quota
                ? `${tx.quotaToday} · ${localeDigits(quota.remaining, lang)}/${localeDigits(
                    quota.limit,
                    lang
                  )} ${tx.quotaLeft}`
                : ""}
            </p>
            {value.length >= COUNTER_FROM && (
              <p className="text-[11px] text-muted">
                {localeDigits(value.length, lang)}/{localeDigits(MAX_CHARS, lang)}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
