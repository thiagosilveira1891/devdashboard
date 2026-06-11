import { fromDateKey } from "@/lib/dates";
import { formatHours } from "@/lib/format";
import type { HeatmapCell } from "@/lib/types";

/**
 * Heatmap de actividad unificada — la pieza distintiva del producto.
 * Como el contributions graph de GitHub, pero la intensidad combina
 * commits + horas programadas + problemas resueltos de las 4 plataformas.
 *
 * Server component: 365 celdas con tooltip nativo (title).
 */

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const LEVEL_VAR = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
] as const;

export function Heatmap({ cells }: { cells: HeatmapCell[] }) {
  // Columnas = semanas (lunes arriba). Pad inicial hasta el lunes previo.
  const firstDow = (fromDateKey(cells[0].date).getDay() + 6) % 7;
  const padded: (HeatmapCell | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...cells,
  ];
  const weeks: (HeatmapCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Etiqueta de mes en la primera semana de cada mes nuevo
  const monthLabels = weeks.map((week, i) => {
    const firstDay = week.find(Boolean);
    if (!firstDay) return null;
    const month = fromDateKey(firstDay.date).getMonth();
    const prev = weeks[i - 1]?.find(Boolean);
    if (!prev || fromDateKey(prev.date).getMonth() !== month) {
      return MONTHS[month];
    }
    return null;
  });

  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-fit">
        <div className="flex gap-[3px] mb-1.5 ml-0">
          {weeks.map((_, i) => (
            <span
              key={i}
              className="w-[11px] text-[9px] text-[var(--text-faint)] leading-none"
            >
              {monthLabels[i] ?? ""}
            </span>
          ))}
        </div>
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, di) => {
                const cell = week[di];
                if (!cell) {
                  return <span key={di} className="size-[11px]" />;
                }
                const parts = [
                  cell.commits > 0 ? `${cell.commits} commits` : null,
                  cell.codingSeconds > 0 ? formatHours(cell.codingSeconds) : null,
                  cell.problems > 0 ? `${cell.problems} problemas` : null,
                ].filter(Boolean);
                return (
                  <span
                    key={di}
                    title={`${cell.date} — ${parts.length ? parts.join(" · ") : "sin actividad"}`}
                    className="size-[11px] rounded-[2.5px]"
                    style={{ backgroundColor: LEVEL_VAR[cell.level] }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[var(--text-faint)]">
          <span>menos</span>
          {LEVEL_VAR.map((v) => (
            <span
              key={v}
              className="size-[10px] rounded-[2.5px]"
              style={{ backgroundColor: v }}
            />
          ))}
          <span>más</span>
          <span className="ml-auto">
            commits + horas + problemas, de las 4 plataformas
          </span>
        </div>
      </div>
    </div>
  );
}
