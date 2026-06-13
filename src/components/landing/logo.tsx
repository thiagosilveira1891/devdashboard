/**
 * Marca de DevDash: 2×2 celdas del heatmap en sus cuatro niveles de calor.
 * El logo es literalmente el producto (el gráfico de contribución unificado).
 */
export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 grid-cols-2 gap-[2px]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="rounded-[2px] bg-[#312E81]" />
      <span className="rounded-[2px] bg-[#6366F1]" />
      <span className="rounded-[2px] bg-[#4338CA]" />
      <span className="rounded-[2px] bg-[#A5B4FC]" />
    </span>
  );
}
