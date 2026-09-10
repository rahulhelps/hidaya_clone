"use client";

import { useEffect, useRef, useState } from "react";
import { getSurahAudioUrl } from "@/lib/quran";
import { useLanguage } from "@/context/LanguageContext";
import t from "@/lib/translations";
import Icon from "./Icon";
import { Spinner } from "./ui";

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

export default function AudioPlayer({ surahId, reciterId }: { surahId: number; reciterId?: number }) {
  const { lang } = useLanguage();
  const bn = lang === "bn" ? "font-bn" : "";
  const tx = t[lang].quran;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    // Reset when surah changes.
    setUrl(null);
    setPlaying(false);
    setCur(0);
    setDur(0);
  }, [surahId, reciterId]);

  const toggle = async () => {
    if (!url) {
      setLoading(true);
      try {
        const u = await getSurahAudioUrl(surahId, reciterId);
        setUrl(u);
        // Wait a tick for the <audio> src to bind, then play.
        setTimeout(() => audioRef.current?.play(), 60);
        setPlaying(true);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
      return;
    }
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
    } else {
      audioRef.current?.play();
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-3">
      <button
        onClick={toggle}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-on-gold transition hover:brightness-110"
        aria-label={playing ? tx.pause : tx.playAudio}
      >
        {loading ? <Spinner className="h-5 w-5" /> : <Icon name={playing ? "pause" : "play"} size={20} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium text-text ${bn}`}>{tx.playAudio}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={dur || 0}
            value={cur}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (audioRef.current) audioRef.current.currentTime = v;
              setCur(v);
            }}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-border accent-gold"
          />
          <span className="text-[11px] tabular-nums text-muted">{fmt(cur)} / {fmt(dur)}</span>
        </div>
      </div>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onEnded={() => { setPlaying(false); setCur(0); }}
        />
      )}
    </div>
  );
}
