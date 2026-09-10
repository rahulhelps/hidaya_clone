import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, Amiri, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppShell from "@/components/AppShell";
import AuthGate from "@/components/AuthGate";
import SWRegister from "@/components/SWRegister";
import SyncManager from "@/components/SyncManager";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hidayah: Prayer Times, Quran, Qibla & Duas",
  description:
    "A refined Islamic companion: accurate prayer times, qibla compass, the Noble Quran, daily duas, 99 Names, tasbih, the Hijri calendar and hadith, in Bangla and English.",
  keywords:
    "prayer times, namaz, salah, qibla, quran, dua, hadith, hijri calendar, tasbih, islamic app, Bangladesh, Hidayah",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Hidayah",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5efe1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Shrink the layout viewport when the on-screen keyboard opens. The chat
  // page's h-dvh column then re-lays out so the composer sits on the keyboard
  // and the fixed bottom nav rides above it instead of hiding behind it.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="bn"
      className={`${fraunces.variable} ${hanken.variable} ${amiri.variable} ${hindSiliguri.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">
        <ThemeProvider>
          <LanguageProvider>
            <AuthGate>
              <AppShell>{children}</AppShell>
            </AuthGate>
          </LanguageProvider>
        </ThemeProvider>
        <SWRegister />
        <SyncManager />
      </body>
    </html>
  );
}
