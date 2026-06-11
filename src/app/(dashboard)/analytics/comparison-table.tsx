"use client";

import { formatHours } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ComparisonRow } from "./data";

export function ComparisonTable({
  current,
}: {
  current: ComparisonRow[];
  previous: ComparisonRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-[11px] text-muted-foreground border-b border-border">
            <th className="text-left py-2 font-medium">Métrica</th>
            <th className="text-right py-2 font-medium">Actual</th>
            <th className="text-right py-2 font-medium">Anterior</th>
            <th className="text-right py-2 font-medium w-[80px]">Δ</th>
          </tr>
        </thead>
        <tbody>
          {current.map((row) => (
            <tr key={row.metric} className="border-b border-border/50">
              <td className="py-2.5">{row.metric}</td>
              <td className="text-right py-2.5 tabular-nums font-medium">
                {row.format === "hours"
                  ? formatHours(row.current)
                  : row.current}
              </td>
              <td className="text-right py-2.5 tabular-nums text-muted-foreground">
                {row.format === "hours"
                  ? formatHours(row.previous)
                  : row.previous}
              </td>
              <td
                className={cn(
                  "text-right py-2.5 tabular-nums font-medium",
                  row.deltaPct !== null && row.deltaPct > 0
                    ? "text-green-400"
                    : row.deltaPct !== null && row.deltaPct < 0
                      ? "text-red-400"
                      : "text-muted-foreground",
                )}
              >
                {row.deltaPct !== null
                  ? `${row.deltaPct > 0 ? "+" : ""}${row.deltaPct}%`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
