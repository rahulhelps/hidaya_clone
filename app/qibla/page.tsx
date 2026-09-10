"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { loadPlace, qiblaBearing, qiblaDistanceKm, type Place } from "@/lib/geo";
import Icon from "@/components/Icon";
import { Button, Card, PageHeader, useMounted } from "@/components/ui";

type OrientationEventiOS = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function QiblaPage() {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].qibla;
  const mounted = useMounted();

  const [place, setPlace] = useState<Place | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);

  useEffect(() => {
    setPlace(loadPlace());
    const Ev = window.DeviceOrientationEvent as OrientationEventiOS | undefined;
    if (Ev && typeof Ev.requestPermission === "function") setNeedsPermission(true);
  }, []);

  const onOrient = useCallback((e: DeviceOrientationEvent) => {
    const webkit = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof webkit === "number") setHeading(webkit);
    else if (e.alpha != null) setHeading((360 - e.alpha) % 360);
  }, []);

  const attach = useCallback(() => {
    window.addEventListener("deviceorientationabsolute", onOrient as EventListener);
    window.addEventListener("deviceorientation", onOrient as EventListener);
  }, [onOrient]);

  useEffect(() => {
    if (!mounted || needsPermission) return;
    attach();
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrient as EventListener);
      window.removeEventListener("deviceorientation", onOrient as EventListener);
    };
  }, [mounted, needsPermission, attach, onOrient]);

  const enableCompass = async () => {
    const Ev = window.DeviceOrientationEvent as OrientationEventiOS;
    try {
      const res = await Ev.requestPermission?.();
      if (res === "granted") {
        setNeedsPermission(false);
        attach();
      }
    } catch {
      /* ignore */
    }
  };

  const bearing = place ? qiblaBearing(place) : 0;
  const distance = place ? qiblaDistanceKm(place) : 0;
  const live = heading != null;
  // Angle of the Qibla marker relative to where the device currently points.
  const qiblaOnScreen = live ? (bearing - (heading as number) + 360) % 360 : bearing;
  const aligned = live && Math.min(qiblaOnScreen, 360 - qiblaOnScreen) < 6;

  return (
    <div>
      <PageHeader title={tx.title} subtitle={tx.subtitle} />

      <Card className="overflow-hidden">
        <div className="atmo girih-bg flex flex-col items-center px-6 py-9">
          {/* Compass */}
          <div className="relative grid h-72 w-72 place-items-center">
            {/* Fixed forward pointer (top) */}
            <div className="absolute -top-1 z-20 flex flex-col items-center">
              <div
                className={`h-0 w-0 border-x-8 border-t-[14px] border-x-transparent transition-colors ${
                  aligned ? "border-t-jade" : "border-t-gold"
                }`}
              />
            </div>

            {/* Rose - rotates to show true cardinal orientation */}
            <div
              className="absolute inset-0 rounded-full border border-white/15 bg-black/20 backdrop-blur transition-transform duration-200"
              style={{ transform: live ? `rotate(${-(heading as number)}deg)` : undefined }}
            >
              {(["N", "E", "S", "W"] as const).map((c, i) => (
                <span
                  key={c}
                  className="absolute left-1/2 top-3 -translate-x-1/2 text-sm font-bold text-white/70"
                  style={{ transform: `rotate(${i * 90}deg)`, transformOrigin: "50% 132px" }}
                >
                  {c}
                </span>
              ))}
              {/* tick marks */}
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-2 h-3 w-px bg-white/20"
                  style={{ transform: `rotate(${i * 15}deg)`, transformOrigin: "50% 142px" }}
                />
              ))}
            </div>

            {/* Qibla needle */}
            <div
              className="absolute inset-0 transition-transform duration-200"
              style={{ transform: `rotate(${qiblaOnScreen}deg)` }}
            >
              <div className="absolute left-1/2 top-7 flex -translate-x-1/2 flex-col items-center">
                <span className={`grid h-11 w-11 place-items-center rounded-full border-2 shadow-lg transition-colors ${aligned ? "border-jade bg-jade text-on-gold" : "border-gold bg-card text-gold"}`}>
                  <Icon name="kaaba" size={22} />
                </span>
              </div>
            </div>

            {/* Center hub */}
            <div className="z-10 grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-black/30 text-center">
              <span className="font-display text-lg font-semibold text-gilded tabular-nums">
                {Math.round(bearing)}°
              </span>
            </div>
          </div>

          <p className={`mt-6 max-w-xs text-center text-sm text-white/70 ${bn}`}>
            {live ? tx.facing : tx.noCompass}
          </p>
        </div>

        {/* Readouts */}
        <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
          <div className="px-5 py-4 text-center">
            <p className={`text-xs text-muted ${bn}`}>{tx.direction}</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-text tabular-nums">{Math.round(bearing)}°</p>
          </div>
          <div className="px-5 py-4 text-center">
            <p className={`text-xs text-muted ${bn}`}>{tx.distance}</p>
            <p className="mt-0.5 font-display text-xl font-semibold text-text tabular-nums">
              {distance.toLocaleString()} km
            </p>
          </div>
        </div>
      </Card>

      {needsPermission && (
        <Button className="mt-5 w-full py-3.5" onClick={enableCompass}>
          <Icon name="compass" size={18} />
          <span className={bn}>{tx.permission}</span>
        </Button>
      )}
      <p className={`mt-3 text-center text-xs text-muted ${bn}`}>{tx.calibrate}</p>
    </div>
  );
}
