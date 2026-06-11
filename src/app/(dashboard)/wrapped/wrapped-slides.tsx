"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatHours, formatNumber } from "@/lib/format";

export interface WrappedData {
  month: string;
  year: number;
  commits: number;
  codingSeconds: number;
  problems: number;
  bestDayHours: number;
  bestDayLabel: string;
  activeDays: number;
  topLang: { name: string; hours: number } | null;
  streak: { current: number; longest: number };
  ccs: { score: number } | null;
  isDemo: boolean;
}

interface Slide {
  key: string;
  render: (d: WrappedData) => React.ReactNode;
}

const SLIDES: Slide[] = [
  {
    key: "totals",
    render: (d) => (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
          {d.month} {d.year}
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <Card className="p-4 text-center">
            <p className="stat-number text-[28px] font-semibold">{formatNumber(d.commits)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Commits</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="stat-number text-[28px] font-semibold">{formatHours(d.codingSeconds)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Horas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="stat-number text-[28px] font-semibold">{formatNumber(d.problems)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Problemas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="stat-number text-[28px] font-semibold">{d.activeDays}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Días activos</p>
          </Card>
        </div>
      </div>
    ),
  },
  {
    key: "top-lang",
    render: (d) => (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
          Tu lenguaje del mes
        </p>
        {d.topLang ? (
          <>
            <p className="text-5xl font-semibold tracking-tight text-primary">
              {d.topLang.name}
            </p>
            <p className="text-muted-foreground">{d.topLang.hours}h programadas</p>
          </>
        ) : (
          <p className="text-muted-foreground">Conecta WakaTime para ver tus lenguajes</p>
        )}
      </div>
    ),
  },
  {
    key: "best-day",
    render: (d) => (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
          Tu día récord
        </p>
        {d.bestDayLabel ? (
          <>
            <p className="text-5xl font-semibold tracking-tight text-[var(--warning)]">
              {d.bestDayHours}h
            </p>
            <p className="text-muted-foreground">
              {d.bestDayLabel} — tu día más intenso del mes
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">Programa más este mes para establecer un récord</p>
        )}
      </div>
    ),
  },
  {
    key: "consistency",
    render: (d) => (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
          Consistencia
        </p>
        <div className="flex items-center gap-4">
          <Card className="p-4 text-center">
            <p className="stat-number text-[28px] font-semibold text-[var(--warning)]">
              {d.streak.current}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">Racha actual</p>
          </Card>
          {d.ccs && (
            <Card className="p-4 text-center">
              <p className="stat-number text-[28px] font-semibold text-primary">
                {d.ccs.score}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">CCS</p>
            </Card>
          )}
        </div>
        <p className="text-muted-foreground text-[13px] max-w-xs">
          {d.activeDays} de ~30 días activo este mes
          {d.ccs && ` · CCS: ${d.ccs.score}/100`}
        </p>
      </div>
    ),
  },
  {
    key: "share",
    render: (d) => (
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-[13px] uppercase tracking-widest text-muted-foreground">
          {d.month} completado
        </p>
        <p className="text-3xl font-semibold tracking-tight">
          ¡Comparte tu mes!
        </p>
        <p className="text-muted-foreground text-[13px] max-w-xs">
          {d.commits} commits · {d.topLang?.name ?? "??"} · {d.activeDays} días activos
        </p>
        <div className="flex gap-2 mt-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard">
              Dashboard <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="size-3 mr-1" /> Compartir
          </Button>
        </div>
      </div>
    ),
  },
];

export function WrappedSlides({ data }: { data: WrappedData }) {
  const [slide, setSlide] = useState(0);

  const next = useCallback(
    () => setSlide((s) => Math.min(s + 1, SLIDES.length - 1)),
    [],
  );
  const prev = useCallback(() => setSlide((s) => Math.max(s - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-6">
      <FadeIn key={slide}>
        <div className="max-w-md w-full">
          {SLIDES[slide].render(data)}
        </div>
      </FadeIn>

      <div className="flex items-center gap-3 mt-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={prev}
          disabled={slide === 0}
          className="size-8"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`size-1.5 rounded-full transition-colors ${i === slide ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          disabled={slide === SLIDES.length - 1}
          className="size-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <Link
        href="/dashboard"
        className="text-[12px] text-muted-foreground hover:text-foreground mt-6 transition-colors"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
