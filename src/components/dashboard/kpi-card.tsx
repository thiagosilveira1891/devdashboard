"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * KPI card: número grande en mono + delta vs período anterior + sparkline
 * de la serie diaria al pie.
 */
export function KpiCard({
  title,
  value,
  deltaPct,
  spark,
}: {
  title: string;
  value: string;
  deltaPct: number | null;
  spark: number[];
}) {
  const data = spark.map((v, i) => ({ i, v }));
  const deltaLabel =
    deltaPct === null
      ? null
      : `${deltaPct > 0 ? "▲" : deltaPct < 0 ? "▼" : "—"} ${Math.abs(deltaPct)}%`;

  return (
    <Card className="p-5 gap-0 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <p className="text-[12px] text-muted-foreground">{title}</p>
        {deltaLabel && (
          <span
            className={cn(
              "text-[11px] font-medium stat-number",
              deltaPct! > 0
                ? "text-[var(--success)]"
                : deltaPct! < 0
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          >
            {deltaLabel}
          </span>
        )}
      </div>
      <p className="stat-number text-[28px] font-semibold mt-1.5">{value}</p>
      <div className="h-10 mt-3 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="var(--chart-1)"
              strokeWidth={1.5}
              fill={`url(#spark-${title})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
