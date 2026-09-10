"use client";

import { useEffect, useState } from "react";

// ── Hooks ──
/** True only after mount - guards client-only data (localStorage, Date). */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

// ── Spinner ──
export function Spinner({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={`spinner ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V1C5.9 1 1 5.9 1 12h3z"
      />
    </svg>
  );
}

// ── Button ──
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "outline" | "ghost" | "jade";
  loading?: boolean;
};
export function Button({
  variant = "gold",
  loading,
  className = "",
  children,
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60";
  const variants: Record<string, string> = {
    gold: "bg-gold text-on-gold hover:brightness-110 shadow-[0_8px_24px_-8px] shadow-gold/40",
    jade: "bg-jade text-on-gold hover:brightness-110",
    outline: "border border-border-strong text-text hover:bg-card-hi",
    ghost: "text-text-soft hover:bg-card-hi",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}

// ── Card ──
export function Card({
  className = "",
  children,
  as: Tag = "div",
  ...rest
}: { className?: string; children: React.ReactNode; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`rounded-[var(--radius-card)] border border-border bg-card ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Page header ──
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 fade-up">
      <div className="rule-diamond mb-3">
        <span className="text-gold text-xs">◆</span>
      </div>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-text">
        {title}
      </h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
    </header>
  );
}

// ── Skeleton ──
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

// ── States ──
export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <Card className="p-6 text-center">
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4 px-4 py-2 text-sm" onClick={onRetry}>
          {retryLabel ?? "Try again"}
        </Button>
      )}
    </Card>
  );
}

// ── Segmented control ──
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            value === o.value ? "bg-gold text-on-gold" : "text-muted hover:text-text"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Bottom sheet / modal ──
export function Sheet({
  open,
  onClose,
  children,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm fade-up"
        style={{ animationDuration: "0.25s" }}
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-md scale-in">
        <div className="m-3 sm:m-0 rounded-[1.75rem] border border-border-strong bg-surface shadow-2xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
