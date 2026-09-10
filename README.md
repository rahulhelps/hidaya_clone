# Hidayah

A refined, carrier-promoted (BDApps) Islamic companion web app - **prayer times,
qibla, the Noble Quran, duas, the 99 Names, tasbih, the Hijri calendar and
hadith** - bilingual (বাংলা / English), with a free-to-browse core and a premium
OTP-subscription tier.

Sibling of `../thinkfast`; shares its house stack and conventions. Built UI-first
on free public Islamic APIs, designed to wire into `../platform_api` afterward
with no component changes.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4** - runtime-themeable tokens (`@theme inline` + CSS vars), no UI library
- Self-hosted fonts via `next/font`: **Fraunces** (display), **Hanken Grotesk**
  (body), **Amiri** (Arabic), **Hind Siliguri** (Bangla)
- Hand-rolled EN/BN i18n (`lib/translations.ts` + `context/LanguageContext.tsx`), default BN
- Full dark/light theme (`context/ThemeContext.tsx`), default dark

## Design language

*"An app whose atmosphere follows the prayer day."* Editorial-nocturnal Islamic:
ink base, brass-gold signature accent, jade secondary, warm parchment text. The
home hero's gradient mood shifts by time of day (fajr → dhuhr → maghrib → isha)
over a faint 8-point-star *girih* texture.

## Run

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
```

Hidayah is wired to the **`../platform_api`** backend (`apps/hidayah`). Point
`NEXT_PUBLIC_API_BASE_URL` at it (default `http://localhost:8000/api/v1`) and run
the backend (below). To demo the UI standalone with no backend, set
`NEXT_PUBLIC_MOCK_OTP=true` - any 6-digit code except `000000` "subscribes"
(premium reminders/sync need the real backend).

## Data sources (free, no key, CORS-enabled)

| Feature | Source | Module |
|---|---|---|
| Prayer times · qibla · hijri · calendar | Aladhan API | `lib/aladhan.ts`, `lib/geo.ts`, `lib/prayer-utils.ts` |
| Quran (text · translation · audio) | Quran.com API v4 | `lib/quran.ts` |
| Hadith | fawazahmed0/hadith-api (jsDelivr CDN) | `lib/hadith.ts` |
| 99 Names · Duas | bundled JSON (offline) | `lib/data/*` |

All network reads are cached in `localStorage`. Every external call sits behind a
typed function in `lib/` - the platform swap is a one-file change per source.

## Premium gate (BDApps)

Core content is free. Premium extras (audio recitation, bookmark/progress sync,
extra translations, ad-free) sit behind `components/PremiumGate.tsx`, which reads
`lib/subscription.ts`. Subscribing runs the OTP flow in
`components/ActivationForm.tsx` (phone → 6-digit code → activate), with the carrier
charge note shown up front.

## Backend (`../platform_api`, app `apps/hidayah`)

All Hidayah backend logic lives in one Django app, `apps/hidayah`:

- **OTP subscription** - `POST /api/v1/hidayah/auth/otp/{send,verify}`,
  `POST /api/v1/hidayah/auth/unsubscribe`. Verifying activates premium.
- **Premium status** - `GET /api/v1/hidayah/subscription` → `{active}`.
- **Cross-device sync** (premium) - `GET /api/v1/hidayah/sync`,
  `PUT /api/v1/hidayah/sync/{key}` for bookmarks, prayer log, khatm, reader prefs.
- **Web Push reminders** (premium) - `GET /push/vapid`, `POST /push/subscribe`,
  `/push/unsubscribe`, `/push/test`. A Celery-beat task
  (`dispatch_prayer_reminders`, every minute) computes each user's prayer times
  and pushes ~N minutes before - **delivered even when the app is closed.**

Run it:

```bash
cd ../platform_api
cp .env.example .env
python manage.py hidayah_gen_vapid     # paste the 3 HIDAYAH_VAPID_* into .env
python manage.py migrate
python manage.py seed_clients          # registers the hidayah tenant/client
python manage.py runserver             # :8000
celery -A config worker -l info        # for push sends
celery -A config beat -l info          # schedules the per-minute dispatch
```

Reminders need **no paid/third-party push service** - the browser's own push
service delivers, signed with self-generated VAPID keys.

Frontend seams: `lib/api.ts` (endpoints), `lib/subscription.ts` (entitlement),
`lib/reminders.ts` (push subscribe), `lib/cloud-sync.ts` (sync). Components are
unchanged by the backend swap.

## Layout

```
app/            App Router pages (home, prayer, qibla, quran[/surah], duas,
                names, tasbih, calendar, hadith, account) + globals.css
components/     AppShell, Icon, ui primitives, PrayerHero, PrayerTimesRow,
                AudioPlayer, PremiumGate, ActivationForm
context/        Language + Theme providers
lib/            API/data clients, hooks, i18n, auth/subscription, bundled data
```
