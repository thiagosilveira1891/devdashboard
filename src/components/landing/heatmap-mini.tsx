"use client";

import { useState } from "react";
import { HEAT_COLORS, type HeatCell } from "@/components/landing/data";

/**
 * Heatmap autocontenido de la landing: colores fijos (siempre dark) y
 * tooltip propio en inglés. Las fechas solo se calculan al hacer hover,
 * así el markup SSR no depende del reloj.
 */

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

type Props = {
  cells: HeatCell[];
  cellSize?: number;
  gap?: number;
  interactive?: boolean;
  className?: string;
};

function tooltipText(cell: HeatCell, daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const parts = [
    cell.commits > 0 ? `${cell.commits} commits` : null,
    cell.hours > 0 ? `${cell.hours}h coded` : null,
    cell.problems > 0 ? `${cell.problems} problems` : null,
  ].filter(Boolean);
  return `${DATE_FMT.format(date)} — ${parts.length ? parts.join(" · ") : "no activity"}`;
}

export function HeatmapMini({
  cells,
  cellSize = 10,
  gap = 3,
  interactive = false,
  className,
}: Props) {
  const [hover, setHover] = useState<{ wi: number; di: number } | null>(null);

  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const step = cellSize + gap;
  const width = weeks.length * step - gap;
  const hoveredCell = hover ? weeks[hover.wi]?.[hover.di] : null;
  const daysAgo = hover
    ? cells.length - 1 - (hover.wi * 7 + hover.di)
    : 0;

  return (
    <div
      className={`relative w-fit ${className ?? ""}`}
      onMouseLeave={() => setHover(null)}
    >
      <div className="flex" style={{ gap }} aria-hidden>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col" style={{ gap }}>
            {week.map((cell, di) => (
              <span
                key={di}
                onMouseEnter={interactive ? () => setHover({ wi, di }) : undefined}
                className="rounded-[2px]"
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: HEAT_COLORS[cell.level],
                  boxShadow:
                    hover?.wi === wi && hover?.di === di
                      ? "inset 0 0 0 1px #71717A"
                      : undefined,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {interactive && hover && hoveredCell && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-[#27272A] bg-[#18181B] px-2.5 py-1.5 font-mono text-[10px] leading-none text-[#E4E4E7] shadow-lg shadow-black/40"
          style={{
            left: Math.min(Math.max(hover.wi * step + cellSize / 2, 90), width - 90),
            top: hover.di * step - 7,
          }}
        >
          {tooltipText(hoveredCell, daysAgo)}
        </div>
      )}
    </div>
  );
}
