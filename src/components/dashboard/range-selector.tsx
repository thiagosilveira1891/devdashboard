"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RANGE_OPTIONS, type RangeDays } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS: Record<RangeDays, string> = {
  7: "7d",
  30: "30d",
  90: "90d",
  365: "1a",
};

/** Selector de rango persistido en la URL: todo dashboard es enlazable. */
export function RangeSelector({ current }: { current: RangeDays }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(days: RangeDays) {
    const params = new URLSearchParams(searchParams);
    params.set("range", String(days));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center rounded-md border border-border bg-card p-0.5">
      {RANGE_OPTIONS.map((days) => (
        <button
          key={days}
          onClick={() => select(days)}
          className={cn(
            "px-2.5 py-1 text-[12px] rounded-[5px] transition-colors stat-number",
            days === current
              ? "bg-accent text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LABELS[days]}
        </button>
      ))}
    </div>
  );
}
