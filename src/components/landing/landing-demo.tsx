"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Heatmap } from "@/components/dashboard/heatmap";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { computeDashboardData } from "@/lib/data/compute";
import { getDemoSnapshots } from "@/seed/demo-data";
import { formatHours, formatNumber } from "@/lib/format";

const DEMO_USER = {
  name: "Ada Demo",
  username: "ada",
  profileSlug: "ada",
};

export function LandingDemo() {
  const data = useMemo(
    () =>
      computeDashboardData({
        snapshots: getDemoSnapshots(),
        user: DEMO_USER,
        rangeDays: 30,
        connected: {
          github: true,
          wakatime: true,
          leetcode: true,
          codeforces: true,
        },
        isDemo: true,
        lastSyncedAt: new Date().toISOString(),
      }),
    [],
  );

  return (
    <FadeIn delay={0.2}>
      <section className="relative w-full max-w-4xl mx-auto mt-16 px-4">
        <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl dark:shadow-black/40 overflow-hidden">
          {/* Dashboard header bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-full bg-red-500/60" />
              <div className="size-2.5 rounded-full bg-amber-500/60" />
              <div className="size-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[10px] text-[var(--text-faint)] ml-2 font-mono">
              devdash.app/u/ada
            </span>
            <div className="ml-auto flex items-center gap-1.5 rounded-md border border-border/40 bg-card/50 px-2.5 h-7">
              <Flame className="size-3 text-[var(--warning)]" />
              <span className="stat-number text-[11px] font-semibold">
                {data.streak.current}
              </span>
              <span className="text-[10px] text-muted-foreground">
                días
              </span>
            </div>
          </div>

          {/* Mini dashboard */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="p-3">
                <p className="text-[10px] text-muted-foreground">Commits</p>
                <p className="stat-number text-[22px] font-semibold mt-0.5">
                  {formatNumber(data.kpis.commits.value)}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-[10px] text-muted-foreground">Horas</p>
                <p className="stat-number text-[22px] font-semibold mt-0.5">
                  {formatHours(data.kpis.codingSeconds.value)}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-[10px] text-muted-foreground">Problemas</p>
                <p className="stat-number text-[22px] font-semibold mt-0.5">
                  {formatNumber(data.kpis.problemsSolved.value)}
                </p>
              </Card>
              <Card className="p-3">
                <p className="text-[10px] text-muted-foreground">Rating CF</p>
                <p className="stat-number text-[22px] font-semibold mt-0.5">
                  {data.rating.current ?? "—"}
                </p>
                <p className="text-[10px] capitalize text-[var(--chart-4)]">
                  {data.rating.currentRank ?? "—"}
                </p>
              </Card>
            </div>

            {/* Mini heatmap */}
            <div className="overflow-hidden rounded-lg">
              <Heatmap cells={data.heatmap.slice(-91)} />
            </div>

            {/* Languages summary + CTA */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>Top:</span>
              {data.languages.slice(0, 4).map((l) => (
                <span
                  key={l.name}
                  className="px-1.5 py-0.5 rounded bg-surface-2 border border-border/50"
                >
                  {l.name} {l.pct}%
                </span>
              ))}
              <Button asChild variant="link" size="sm" className="ml-auto text-[12px]">
                <Link href="/dashboard">
                  Abrir demo completo <ArrowRight className="size-3 ml-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
