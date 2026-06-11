"use client";

import { cn } from "@/lib/utils";
import type { WeekdayBar } from "./data";

export function WeekdayChart({ data }: { data: WeekdayBar[] }) {
  const maxHours = Math.max(...data.map((d) => d.hours), 1);

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d) => {
        const pct = (d.hours / maxHours) * 100;
        return (
          <div
            key={d.day}
            className="flex-1 flex flex-col items-center gap-1.5 min-w-0"
          >
            <span className="text-[10px] tabular-nums text-[var(--text-faint)]">
              {d.hours > 0 ? `${d.hours}h` : ""}
            </span>
            <div
              className={cn(
                "w-full rounded-sm transition-all",
                pct > 0
                  ? "bg-primary/60"
                  : "bg-border/30",
              )}
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
