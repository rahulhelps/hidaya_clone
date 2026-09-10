"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { sendOtp, verifyOtp, authStateFromVerify, authStateFromSend } from "@/lib/api";
import { saveAuth } from "@/lib/auth-store";
import { activate } from "@/lib/subscription";
import Icon from "./Icon";
import { Button, Spinner } from "./ui";

type Step = "phone" | "otp" | "success";
const OTP_LENGTH = 6;
const emptyOtp = () => Array(OTP_LENGTH).fill("");

const SERVICE_ERROR_RE = /temporary system error|system error|internal error/i;
const friendly = (msg: string, fallback: string) =>
  SERVICE_ERROR_RE.test(msg) ? fallback : msg;

export default function ActivationForm({
  onDone,
  onStep,
  hideSteps,
}: {
  onDone?: () => void;
  /** Notified whenever the internal step changes - lets a parent drive an external step rail. */
  onStep?: (s: Step) => void;
  /** Hide the built-in horizontal step indicator (when an external rail is shown instead). */
  hideSteps?: boolean;
}) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].form;

  const [step, setStep] = useState<Step>("phone");

  useEffect(() => { onStep?.(step); }, [step, onStep]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [referenceNo, setReferenceNo] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  useEffect(() => setError(""), [lang]);

  const startTimer = useCallback(() => {
    setResendTimer(60);
    timerRef.current = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  const finishSuccess = () => {
    activate();
    setStep("success");
  };

  const handleSend = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await sendOtp(phone);
      if (result.alreadyRegistered) {
        saveAuth(authStateFromSend(result));
        finishSuccess();
        return;
      }
      setReferenceNo(result.referenceNo);
      setStep("otp");
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : tx.errSendFail, tx.errService));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = useCallback(
    async (value?: string) => {
      const code = value || otp.join("");
      if (code.length !== OTP_LENGTH) { setError(tx.errRequired); return; }
      setError("");
      setLoading(true);
      try {
        const result = await verifyOtp(phone, referenceNo, code);
        saveAuth(authStateFromVerify(result));
        finishSuccess();
      } catch (err) {
        setError(friendly(err instanceof Error ? err.message : tx.errOtpFail, tx.errService));
        setOtp(emptyOtp());
        otpRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [otp, phone, referenceNo, tx]
  );

  const onOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError("");
    if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    if (val && idx === OTP_LENGTH - 1 && next.every(Boolean)) handleVerify(next.join(""));
  };

  const onOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      setTimeout(() => handleVerify(pasted), 80);
    }
  };

  const inputCls =
    "h-12 w-10 sm:w-11 rounded-xl border-2 border-border bg-card text-center text-xl font-bold text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";

  if (step === "success") {
    return (
      <div className="p-6 text-center scale-in">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-gold text-on-gold">
          <Icon name="check" size={32} />
        </div>
        <h3 className={`font-display text-2xl font-semibold text-text ${bn}`}>{tx.successTitle}</h3>
        <p className={`mt-1.5 text-sm text-muted ${bn}`}>{tx.successMsg}</p>
        <p className="mt-0.5 font-semibold text-gold">+88 {phone}</p>
        <Button className="mt-6 w-full py-3.5" onClick={onDone}>
          {tx.done}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Step indicator */}
      {!hideSteps && (
        <div className="mb-6 flex items-center gap-2">
          {(["phone", "otp"] as const).map((s, i) => {
            const reached = step === s || (step === "otp" && s === "phone");
            return (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                    reached ? "bg-gold text-on-gold" : "bg-card text-muted"
                  }`}
                >
                  {step === "otp" && s === "phone" ? <Icon name="check" size={14} /> : i + 1}
                </span>
                {i === 0 && <span className="h-0.5 flex-1 rounded bg-border" />}
              </div>
            );
          })}
        </div>
      )}

      {step === "phone" && (
        <div className="fade-up">
          <h3 className={`font-display text-xl font-semibold text-text ${bn}`}>{tx.phoneTitle}</h3>
          <p className={`mb-5 mt-1 text-sm text-muted ${bn}`}>{tx.phoneSubtitle}</p>
          <label className={`mb-2 block text-sm font-medium text-text-soft ${bn}`}>{tx.phoneLabel}</label>
          <div className="flex gap-2">
            <span className="grid place-items-center rounded-xl border-2 border-border bg-card px-3 text-sm font-medium text-text-soft">
              🇧🇩 +88
            </span>
            <input
              type="tel"
              inputMode="numeric"
              className="flex-1 rounded-xl border-2 border-border bg-card px-4 text-lg text-text outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
              placeholder="01XXXXXXXXX"
              value={phone}
              maxLength={11}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && phone.length === 11 && handleSend()}
              autoFocus
            />
          </div>
          {error && <ErrorLine bn={bn}>{error}</ErrorLine>}
          <Button className="mt-5 w-full py-3.5" loading={loading} disabled={phone.length !== 11} onClick={handleSend}>
            {loading ? tx.sendingOtp : tx.sendOtp}
          </Button>
          <p className={`mt-3 text-center text-xs leading-relaxed text-muted ${bn}`}>
            {lang === "bn" ? "লগইন করলে আপনি আমাদের " : "By logging in, you agree to our "}
            <a href="/terms" className="font-medium text-gold hover:underline">
              {lang === "bn" ? "শর্তাবলী" : "Terms"}
            </a>
            {lang === "bn" ? " ও " : " & "}
            <a href="/privacy" className="font-medium text-gold hover:underline">
              {lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
            </a>
            {lang === "bn" ? "তে সম্মত হচ্ছেন।" : "."}
          </p>
        </div>
      )}

      {step === "otp" && (
        <div className="fade-up">
          <h3 className={`font-display text-xl font-semibold text-text ${bn}`}>{tx.otpTitle}</h3>
          <p className={`mt-1 text-sm text-muted ${bn}`}>
            {tx.otpSentTo} <span className="font-semibold text-text">+88 {phone}</span>
          </p>
          <p className={`mb-5 mt-0.5 text-xs text-muted ${bn}`}>{tx.otpValidity}</p>
          <div className="mb-2 flex justify-center gap-1.5 sm:gap-2" onPaste={onOtpPaste}>
            {otp.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => { otpRefs.current[idx] = el; }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                className={inputCls}
                onChange={(e) => onOtpChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
                }}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {error && <ErrorLine bn={bn}>{error}</ErrorLine>}
          <Button className="mt-4 w-full py-3.5" loading={loading} disabled={otp.some((d) => !d)} onClick={() => handleVerify()}>
            {loading ? tx.verifying : tx.verifyBtn}
          </Button>
          <div className="mt-4 flex items-center justify-between text-sm">
            <button onClick={() => { setStep("phone"); setOtp(emptyOtp()); setError(""); }} className={`text-muted hover:text-text ${bn}`}>
              {tx.changeNumber}
            </button>
            <button
              onClick={() => { if (resendTimer === 0) { setOtp(emptyOtp()); handleSend(); } }}
              disabled={resendTimer > 0}
              className={`font-medium disabled:cursor-not-allowed ${resendTimer > 0 ? "text-muted" : "text-gold"} ${bn}`}
            >
              {resendTimer > 0 ? tx.resendIn(resendTimer) : tx.resendOtp}
            </button>
          </div>
          {loading && <div className="pointer-events-none mt-4 flex justify-center text-gold"><Spinner /></div>}
        </div>
      )}
    </div>
  );
}

function ErrorLine({ children, bn }: { children: React.ReactNode; bn: string }) {
  return (
    <div className={`mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 ${bn}`}>
      {children}
    </div>
  );
}
