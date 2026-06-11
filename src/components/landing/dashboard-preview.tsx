"use client";

import { useMemo } from "react";
import { Flame, GitCommit, Clock, Code, Zap } from "lucide-react";
import { Heatmap } from "@/components/dashboard/heatmap";
import { computeDashboardData } from "@/lib/data/compute";
import { getDemoSnapshots } from "@/seed/demo-data";
import { formatHours, formatNumber } from "@/lib/format";

const DEMO_USER = { name: "Ada Demo", username: "ada", profileSlug: "ada" };

export function DashboardPreview() {
  const data = useMemo(
    () =>
      computeDashboardData({
        snapshots: getDemoSnapshots(),
        user: DEMO_USER,
        rangeDays: 30,
        connected: { github: true, wakatime: true, leetcode: true, codeforces: true },
        isDemo: true,
        lastSyncedAt: new Date().toISOString(),
      }),
    [],
  );

  return (
    <div className="rounded-lg border border-[#27272a] bg-[#09090b] overflow-hidden shadow-2xl shadow-black/40">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#27272a] bg-[#0c0c0e]">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-[#ef4444]/70" />
          <div className="size-2.5 rounded-full bg-[#f59e0b]/70" />
          <div className="size-2.5 rounded-full bg-[#22c55e]/70" />
        </div>
        <span className="text-[11px] text-[#52525b] ml-2 font-mono tracking-tight">
          devdash.app/u/ada
        </span>
        <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#27272a] bg-[#111113] px-2.5 h-6">
          <Flame className="size-3 text-[#f59e0b]" />
          <span className="font-mono text-[11px] font-semibold tabular-nums text-[#fafafa]">
            {data.streak.current}
          </span>
          <span className="text-[10px] text-[#a1a1aa]">días</span>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div>
            <div className="h-3.5 w-32 rounded bg-[#1c1c1f] animate-pulse" />
            <div className="h-2.5 w-44 rounded bg-[#1c1c1f] animate-pulse mt-1.5" />
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-md border border-[#27272a] bg-[#111113] px-2 h-6">
            <span className="text-[10px] text-[#7c3aed] font-medium mr-0.5">CCS</span>
            <span className="font-mono text-[11px] font-semibold tabular-nums text-[#7c3aed]">
              {data.ccs?.score ?? 78}
            </span>
          </div>
          <div className="flex rounded-md border border-[#27272a] bg-[#111113] overflow-hidden h-6">
            {["7d", "30d", "90d", "1y"].map((r, i) => (
              <span
                key={r}
                className={`px-2 text-[10px] flex items-center ${i === 1 ? "bg-[#1c1c1f] text-[#fafafa]" : "text-[#52525b]"}`}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <GitCommit className="size-3" />, label: "Commits", value: formatNumber(data.kpis.commits.value) },
            { icon: <Clock className="size-3" />, label: "Horas", value: formatHours(data.kpis.codingSeconds.value) },
            { icon: <Code className="size-3" />, label: "Problemas", value: formatNumber(data.kpis.problemsSolved.value) },
            { icon: <Zap className="size-3" />, label: "Rating CF", value: data.rating.current ? String(data.rating.current) : "—" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-md border border-[#27272a] bg-[#111113] p-2.5">
              <div className="flex items-center gap-1 text-[10px] text-[#a1a1aa]">
                {kpi.icon}
                {kpi.label}
              </div>
              <p className="font-mono text-[17px] font-semibold tabular-nums text-[#fafafa] mt-0.5">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <div className="rounded-md border border-[#27272a] bg-[#111113] p-3">
          <p className="text-[10px] text-[#a1a1aa] mb-2">Actividad · últimos 3 meses</p>
          <Heatmap cells={data.heatmap.slice(-91)} />
        </div>

        {/* Languages + Languages row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-[#27272a] bg-[#111113] p-3">
            <p className="text-[10px] text-[#a1a1aa] mb-2">Lenguajes</p>
            <div className="space-y-1.5">
              {data.languages.slice(0, 4).map((l) => (
                <div key={l.name} className="flex items-center gap-2">
                  <span className="text-[11px] text-[#fafafa] w-20 truncate">{l.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[#1c1c1f] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7c3aed]"
                      style={{ width: `${l.pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#52525b] font-mono tabular-nums w-8 text-right">
                    {l.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-[#27272a] bg-[#111113] p-3">
            <p className="text-[10px] text-[#a1a1aa] mb-2">Rating</p>
            <div className="h-16 flex items-end gap-0.5">
              {data.rating.codeforces.slice(-30).map((p, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-[#7c3aed]/60"
                  style={{ height: `${Math.max(4, ((p.rating - 1300) / 400) * 100)}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-[#52525b] mt-1">
              <span>30d</span>
              <span className="text-[#7c3aed] font-medium">
                {data.rating.current ?? "—"} {data.rating.currentRank ?? ""}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
