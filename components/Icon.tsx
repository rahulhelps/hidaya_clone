// Lightweight inline icon set - no dependency. Stroke-based, 24×24, currentColor.

import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "book"
  | "compass"
  | "hands"
  | "grid"
  | "clock"
  | "sparkle"
  | "beads"
  | "calendar"
  | "scroll"
  | "feather"
  | "user"
  | "sun"
  | "moon"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "play"
  | "pause"
  | "location"
  | "search"
  | "check"
  | "x"
  | "globe"
  | "lock"
  | "star"
  | "heart"
  | "refresh"
  | "kaaba"
  | "arrow-right"
  | "arrow-down"
  | "chat"
  | "send"
  | "copy"
  | "plus"
  | "trash"
  | "pencil"
  | "stop";

const P: Record<IconName, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  // The three dots read as "AI conversation" and echo the typing indicator.
  chat: (
    <>
      <path d="M20.5 11.4c0 4-3.8 7.3-8.5 7.3-1 0-2-.15-2.9-.42L4 20.5l1.45-3.8A7 7 0 0 1 3.5 11.4C3.5 7.4 7.3 4.1 12 4.1s8.5 3.3 8.5 7.3Z" />
      <path d="M8.5 11.4h.01M12 11.4h.01M15.5 11.4h.01" />
    </>
  ),
  send: (
    <>
      <path d="M4.5 12 20 5l-7 15-2.5-6.5z" />
      <path d="m10.5 13.5 9.5-8.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M15 6.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h.5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="m6.5 7 .8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9L17.5 7" />
    </>
  ),
  pencil: (
    <>
      <path d="M4.5 19.5h4L20 8a2.1 2.1 0 0 0-3-3L5.5 16.5z" />
      <path d="m15 5.5 3.5 3.5" />
    </>
  ),
  stop: <rect x="7" y="7" width="10" height="10" rx="2" />,
  "arrow-down": <path d="M12 5v14M6 13l6 6 6-6" />,
  feather: (
    <>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <path d="M16 8 2 22" />
      <path d="M17.5 15H9" />
    </>
  ),
  book: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
  hands: (
    <>
      <path d="M12 21c4-2.5 7-5.5 7-9.5a3 3 0 0 0-5.4-1.8L12 11l-1.6-1.3A3 3 0 0 0 5 11.5C5 15.5 8 18.5 12 21Z" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="6.5" height="6.5" rx="1.4" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  sparkle: <path d="M12 3c.5 4.5 1.5 5.5 6 6-4.5.5-5.5 1.5-6 6-.5-4.5-1.5-5.5-6-6 4.5-.5 5.5-1.5 6-6Z" />,
  beads: (
    <>
      <circle cx="12" cy="5" r="2" />
      <circle cx="5.5" cy="9" r="2" />
      <circle cx="18.5" cy="9" r="2" />
      <circle cx="7.5" cy="16" r="2" />
      <circle cx="16.5" cy="16" r="2" />
      <circle cx="12" cy="19" r="2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  scroll: (
    <>
      <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7" />
      <path d="M7 4a2 2 0 0 0-2 2v1.5h3M9 9h7M9 12.5h7M9 16h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.7-3.7 3.3-5.5 6.5-5.5s5.8 1.8 6.5 5.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "chevron-left": <path d="m15 6-6 6 6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  play: <path d="M7 5.5v13l11-6.5z" />,
  pause: <path d="M8 5.5v13M16 5.5v13" />,
  location: (
    <>
      <path d="M12 21c4-4.5 7-7.8 7-11a7 7 0 1 0-14 0c0 3.2 3 6.5 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9Z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  star: <path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6L12 17.3 6.7 20l1-6L3.4 9.9l6-.9z" />,
  heart: <path d="M12 20s-7-4.3-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.7 12 20 12 20Z" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 1 0-.5 4" />
      <path d="M20 5v6h-6" />
    </>
  ),
  kaaba: (
    <>
      <path d="m12 3 8 4v10l-8 4-8-4V7z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
};

export default function Icon({
  name,
  size = 22,
  ...props
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {P[name]}
    </svg>
  );
}
