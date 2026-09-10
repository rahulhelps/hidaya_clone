<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Hidayah

Carrier-promoted (BDApps) Islamic companion web app - prayer times, qibla, Quran,
duas, 99 names, tasbih, hijri calendar, hadith. Sibling of `../thinkfast`; same
stack (Next 16 App Router, React 19, Tailwind 4, hand-rolled EN/BN i18n,
localStorage JWT). Free public Islamic APIs now; wires to `../platform_api` later.
All external data sits behind a typed function in `lib/` so the platform swap is a
one-file change. Free browse + premium OTP-subscription gate (`components/PremiumGate.tsx`).
