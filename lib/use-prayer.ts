"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getDayTimes,
  loadMethod,
  saveMethod,
  type DayTimes,
} from "./aladhan";
import {
  loadPlace,
  savePlace,
  detectLocation,
  type Place,
} from "./geo";
import {
  atmosphereFor,
  nextPrayer,
  type Atmosphere,
  type NextPrayer,
} from "./prayer-utils";

/** Resolves location + method, fetches the day's timings, exposes setters. */
export function usePrayerData() {
  const [place, setPlaceState] = useState<Place | null>(null);
  const [method, setMethodState] = useState(1);
  const [times, setTimes] = useState<DayTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    setPlaceState(loadPlace());
    setMethodState(loadMethod());
  }, []);

  const load = useCallback(async (p: Place, m: number) => {
    setLoading(true);
    setError("");
    try {
      setTimes(await getDayTimes(p, m));
    } catch {
      setError("Couldn't load prayer times. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (place) load(place, method);
  }, [place, method, load]);

  const setPlace = (p: Place) => {
    savePlace(p);
    setPlaceState(p);
  };
  const setMethod = (m: number) => {
    saveMethod(m);
    setMethodState(m);
  };
  const detect = async () => {
    setLocating(true);
    try {
      setPlace(await detectLocation());
    } catch {
      setError("Location access was denied. Showing your saved city.");
    } finally {
      setLocating(false);
    }
  };

  return { place, setPlace, method, setMethod, times, loading, error, locating, detect, reload: () => place && load(place, method) };
}

/** Ticks every second; returns next prayer + the page's time-of-day mood. */
export function useCountdown(times: DayTimes | null): {
  next: NextPrayer | null;
  atmo: Atmosphere | null;
} {
  const [, force] = useState(0);
  const timingsRef = useRef(times?.timings);
  timingsRef.current = times?.timings;

  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (!times) return { next: null, atmo: null };
  return {
    next: nextPrayer(times.timings),
    atmo: atmosphereFor(times.timings),
  };
}
