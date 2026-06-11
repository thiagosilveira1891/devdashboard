"use client";

import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { WeeklyHoursPoint } from "@/lib/types";

/** Horas programadas por semana (últimas 12) con línea de media. */
export function WeeklyHoursChart({ weeks }: { weeks: WeeklyHoursPoint[] }) {
  const avg =
    weeks.length > 0
      ? weeks.reduce((s, w) => s + w.hours, 0) / weeks.length
      : 0;

  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeks} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-faint)", fontSize: 10 }}
            interval={1}
          />
          <Tooltip
            cursor={{ fill: "var(--accent)", opacity: 0.5 }}
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            formatter={(value) => [`${value} h`, "programadas"]}
            labelFormatter={(label) => `Semana del ${label}`}
          />
          <ReferenceLine
            y={avg}
            stroke="var(--text-faint)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Bar
            dataKey="hours"
            fill="var(--chart-1)"
            radius={[3, 3, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
