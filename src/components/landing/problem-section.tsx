import { LogoMark } from "@/components/landing/logo";
import { HeatmapMini } from "@/components/landing/heatmap-mini";
import { PLATFORMS, generateHeatCells } from "@/components/landing/data";
import { getDict } from "@/components/landing/i18n";
import { eyebrow } from "@/components/landing/styles";

/**
 * Diagrama de pipeline estilo documentación: cuatro fuentes arriba,
 * conectores SVG con flujo animado de datos, y un único nodo DevDash
 * abajo cuya salida es —literalmente— el heatmap unificado.
 */

// Centros de las 4 columnas (en % del ancho) → coordenadas del viewBox
const SOURCE_X = [12.5, 37.5, 62.5, 87.5];

export async function ProblemSection() {
  const t = await getDict();
  return (
    <section className="border-t border-[#27272A]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className={eyebrow}>{t.problem.eyebrow}</p>
        <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-[#FAFAFA] md:text-[36px]">
          {t.problem.title}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#A1A1AA]">
          {t.problem.body}
        </p>

        <div className="relative mt-14">
          {/* Fondo de retícula de puntos, desvanecido en los bordes */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-6 -inset-y-8"
            style={{
              backgroundImage: "radial-gradient(#1F1F23 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse 70% 80% at 50% 50%, black 40%, transparent 100%)",
            }}
          />

          {/* Fuentes */}
          <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
            {PLATFORMS.map((p) => (
              <div
                key={p.name}
                className="rounded-md border border-[#27272A] bg-[#111113] px-4 py-3 transition-colors hover:border-[#3F3F46]"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  />
                  <span className="text-[13px] font-medium text-[#FAFAFA]">
                    {p.name}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#52525B]">
                  → {p.metric}
                </p>
              </div>
            ))}
          </div>

          {/* Conectores (desktop): flujo de datos hacia el nodo central */}
          <div className="relative hidden h-[110px] md:block" aria-hidden>
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 110"
              preserveAspectRatio="none"
            >
              {SOURCE_X.map((x) => (
                <path
                  key={`base-${x}`}
                  d={`M${x} 0 C${x} 60, 50 50, 50 110`}
                  fill="none"
                  stroke="#27272A"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {SOURCE_X.map((x, i) => (
                <path
                  key={`flow-${x}`}
                  d={`M${x} 0 C${x} 60, 50 50, 50 110`}
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray="3 28"
                  style={{
                    animation: "landing-flow 3s linear infinite",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Conector (mobile) */}
          <div className="flex justify-center md:hidden" aria-hidden>
            <div className="my-3 h-10 border-l border-dashed border-[#3F3F46]" />
          </div>

          {/* Nodo unificado */}
          <div className="relative flex justify-center">
            <div className="rounded-lg border border-[#6366F1]/40 bg-[#111113] px-6 py-5">
              <div className="flex items-center gap-3">
                <LogoMark />
                <div>
                  <p className="text-[14px] font-semibold text-[#FAFAFA]">
                    DevDash
                  </p>
                  <p className="font-mono text-[11px] text-[#A1A1AA]">
                    {t.problem.nodeSub}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <HeatmapMini
                  cells={generateHeatCells(20, 5)}
                  cellSize={6}
                  gap={2}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
