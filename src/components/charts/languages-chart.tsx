"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatHours } from "@/lib/format";
import type { LanguageShare } from "@/lib/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8b5cf6",
];

/** Donut de lenguajes (horas de WakaTime en el rango) + leyenda con %. */
export function LanguagesChart({ languages }: { languages: LanguageShare[] }) {
  if (languages.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground py-8 text-center">
        Sin datos de lenguajes en este rango.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="size-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={languages}
              dataKey="seconds"
              nameKey="name"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {languages.map((lang, i) => (
                <Cell key={lang.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-2 min-w-0">
        {languages.map((lang, i) => (
          <li key={lang.name} className="flex items-center gap-2 text-[13px]">
            <span
              className="size-2.5 rounded-[3px] shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="truncate">{lang.name}</span>
            <span className="ml-auto text-muted-foreground stat-number text-[12px]">
              {formatHours(lang.seconds)}
            </span>
            <span className="w-9 text-right text-[var(--text-faint)] stat-number text-[12px]">
              {lang.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
