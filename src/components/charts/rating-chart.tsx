"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RatingPoint } from "@/lib/types";

/** Evolución del rating de Codeforces (último año). */
export function RatingChart({ points }: { points: RatingPoint[] }) {
  if (points.length === 0) {
    return (
      <p className="text-[13px] text-muted-foreground py-8 text-center">
        Sin contests en el último año.
      </p>
    );
  }

  const ratings = points.map((p) => p.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);

  return (
    <div className="h-[180px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={points}
          margin={{ top: 8, right: 0, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id="rating-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-faint)", fontSize: 10 }}
            tickFormatter={(d: string) => d.slice(5, 7) + "/" + d.slice(2, 4)}
            minTickGap={40}
          />
          <YAxis
            domain={[min - 60, max + 60]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--text-faint)", fontSize: 10 }}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--popover-foreground)",
            }}
            formatter={(value) => [value, "rating"]}
          />
          <Area
            type="stepAfter"
            dataKey="rating"
            stroke="var(--chart-4)"
            strokeWidth={1.75}
            fill="url(#rating-fill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
