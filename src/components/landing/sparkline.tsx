/** Línea de serie temporal en SVG puro: sin dependencias, server-safe. */
export function Sparkline({
  data,
  width = 200,
  height = 56,
  stroke = "#6366F1",
  fill = true,
}: {
  data: readonly number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const px = (i: number) => (i / (data.length - 1)) * width;
  const py = (v: number) => height - 4 - ((v - min) / span) * (height - 8);
  const d = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {fill && (
        <path d={`${d} L${width} ${height} L0 ${height} Z`} fill={stroke} opacity={0.08} />
      )}
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} />
      <circle cx={px(data.length - 1)} cy={py(data[data.length - 1])} r={2.5} fill={stroke} />
    </svg>
  );
}
