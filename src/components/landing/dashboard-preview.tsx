"use client";

import { useEffect, useMemo, useRef } from "react";
import { Check, Flame, GitCommit, Zap } from "lucide-react";
import { CountUp } from "@/components/landing/count-up";
import { HeatmapMini } from "@/components/landing/heatmap-mini";
import { LogoMark } from "@/components/landing/logo";
import { Sparkline } from "@/components/landing/sparkline";
import {
  LANGUAGES,
  generateHeatCells,
  generateRatingSeries,
} from "@/components/landing/data";

/**
 * El centro del hero: un screenshot real del producto, renderizado en vivo
 * (no una imagen). Ventana de navegador + app por dentro, con count-up en
 * los KPIs, tooltips en el heatmap y un parallax sutil al hacer scroll.
 */

const KPIS = [
  { label: "COMMITS", value: 287, delta: "+12.4%", deltaColor: "#22C55E" },
  { label: "HOURS CODED", value: 142.6, decimals: 1, suffix: "h", delta: "+8.1%", deltaColor: "#22C55E" },
  { label: "PROBLEMS SOLVED", value: 53, delta: "+24%", deltaColor: "#22C55E" },
  { label: "DAY STREAK", value: 47, delta: "personal best", deltaColor: "#818CF8" },
];

const FEED = [
  {
    icon: <GitCommit className="size-3 text-[#52525B]" />,
    text: "feat: merge wakatime heartbeats into unified timeline",
    meta: "ada/devdash · 2h",
  },
  {
    icon: <Check className="size-3 text-[#22C55E]" />,
    text: "Binary Tree Cameras · Hard · accepted",
    meta: "LeetCode · 5h",
  },
  {
    icon: <Zap className="size-3 text-[#38BDF8]" />,
    text: "Round #1042 Div. 2 · rating 1570 → 1612",
    meta: "Codeforces · 2d",
  },
];

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const heatCells = useMemo(() => generateHeatCells(32, 11), []);
  const rating = useMemo(() => generateRatingSeries(28, 3), []);

  // Parallax sutil: la ventana se desplaza ±10px contra el scroll.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const mid = window.innerHeight / 2;
        const delta = (r.top + r.height / 2 - mid) / mid;
        el.style.transform = `translateY(${(delta * 10).toFixed(1)}px)`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-lg border border-[#27272A] bg-[#0C0C0E] shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)] will-change-transform"
    >
      {/* Chrome del navegador */}
      <div className="flex h-9 items-center gap-2 border-b border-[#27272A] bg-[#111113] px-3.5">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#27272A]" />
          <span className="size-2.5 rounded-full bg-[#27272A]" />
          <span className="size-2.5 rounded-full bg-[#27272A]" />
        </div>
        <div className="mx-auto flex h-6 items-center rounded-md border border-[#27272A] bg-[#09090B] px-3 font-mono text-[10px] text-[#52525B]">
          devdash.app/u/ada
        </div>
        <div className="hidden items-center gap-1.5 font-mono text-[10px] text-[#52525B] sm:flex">
          <span className="size-1.5 rounded-full bg-[#22C55E]" aria-hidden />
          synced 2m ago
        </div>
      </div>

      {/* Barra de la app */}
      <div className="flex h-11 items-center gap-3 border-b border-[#1C1C1F] px-4">
        <LogoMark size={16} />
        <span className="text-[12px] font-medium text-[#FAFAFA]">Ada Lovelace</span>
        <span className="font-mono text-[10px] text-[#52525B]">@ada</span>
        <div className="ml-auto flex h-6 overflow-hidden rounded-md border border-[#27272A] bg-[#111113]">
          {["7d", "30d", "90d", "1y"].map((r) => (
            <span
              key={r}
              className={`flex items-center px-2 font-mono text-[10px] ${
                r === "30d" ? "bg-[#1C1C1F] text-[#FAFAFA]" : "text-[#52525B]"
              }`}
            >
              {r}
            </span>
          ))}
        </div>
        <div className="flex h-6 items-center gap-1.5 rounded-md border border-[#27272A] bg-[#111113] px-2">
          <Flame className="size-3 text-[#F59E0B]" />
          <span className="font-mono text-[11px] font-semibold tabular-nums text-[#FAFAFA]">
            47
          </span>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* KPIs con count-up */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-md border border-[#27272A]/60 bg-[#111113] p-3"
            >
              <p className="font-mono text-[9px] tracking-[0.08em] text-[#52525B]">
                {kpi.label}
              </p>
              <p className="mt-1 font-mono text-[20px] font-semibold tabular-nums leading-none text-[#FAFAFA]">
                <CountUp
                  value={kpi.value}
                  decimals={kpi.decimals ?? 0}
                  suffix={kpi.suffix ?? ""}
                />
              </p>
              <p
                className="mt-1.5 font-mono text-[9px]"
                style={{ color: kpi.deltaColor }}
              >
                {kpi.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Heatmap unificado con tooltips */}
        <div className="rounded-md border border-[#27272A]/60 bg-[#111113] p-3">
          <div className="mb-2.5 flex items-baseline justify-between">
            <p className="text-[11px] font-medium text-[#A1A1AA]">
              Unified activity
            </p>
            <p className="font-mono text-[9px] text-[#52525B]">
              commits + hours + problems
            </p>
          </div>
          <div className="overflow-x-auto">
            <HeatmapMini cells={heatCells} cellSize={10} gap={3} interactive />
          </div>
        </div>

        {/* Lenguajes + rating */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-[#27272A]/60 bg-[#111113] p-3">
            <p className="mb-2.5 text-[11px] font-medium text-[#A1A1AA]">
              Languages
            </p>
            <div className="space-y-2">
              {LANGUAGES.slice(0, 4).map((l) => (
                <div key={l.name} className="flex items-center gap-2">
                  <span className="w-[72px] truncate text-[11px] text-[#E4E4E7]">
                    {l.name}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1C1C1F]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] tabular-nums text-[#52525B]">
                    {l.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-[#27272A]/60 bg-[#111113] p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-medium text-[#A1A1AA]">Codeforces</p>
              <p className="font-mono text-[9px] text-[#22C55E]">+42</p>
            </div>
            <p className="mt-1 font-mono text-[18px] font-semibold tabular-nums leading-none text-[#38BDF8]">
              1,612
              <span className="ml-1.5 text-[10px] font-normal">Expert</span>
            </p>
            <div className="mt-2 h-11">
              <Sparkline data={rating} width={220} height={44} stroke="#38BDF8" />
            </div>
          </div>
        </div>

        {/* Feed de actividad */}
        <div className="divide-y divide-[#1C1C1F] rounded-md border border-[#27272A]/60 bg-[#111113]">
          {FEED.map((item) => (
            <div key={item.text} className="flex h-8 items-center gap-2 px-3">
              {item.icon}
              <span className="truncate text-[11px] text-[#A1A1AA]">
                {item.text}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[9px] text-[#52525B]">
                {item.meta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
