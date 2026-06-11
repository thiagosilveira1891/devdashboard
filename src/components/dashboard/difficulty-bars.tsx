import { formatNumber } from "@/lib/format";

/** Problemas de LeetCode por dificultad: barras horizontales con totales. */
export function DifficultyBars({
  easy,
  medium,
  hard,
  solvedInRange,
  rangeDays,
}: {
  easy: number;
  medium: number;
  hard: number;
  solvedInRange: number;
  rangeDays: number;
}) {
  const total = easy + medium + hard;
  const rows = [
    { label: "Easy", value: easy, color: "var(--success)" },
    { label: "Medium", value: medium, color: "var(--warning)" },
    { label: "Hard", value: hard, color: "var(--destructive)" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <span className="stat-number text-[26px] font-semibold">
          {formatNumber(total)}
        </span>
        <span className="text-[12px] text-muted-foreground">
          resueltos en total
        </span>
        {solvedInRange > 0 && (
          <span className="ml-auto text-[11px] text-[var(--success)] stat-number">
            +{solvedInRange} en {rangeDays} días
          </span>
        )}
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-14 text-[12px] text-muted-foreground">
              {row.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-accent overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: total ? `${(row.value / total) * 100}%` : "0%",
                  backgroundColor: row.color,
                }}
              />
            </div>
            <span className="w-12 text-right stat-number text-[12px]">
              {formatNumber(row.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
