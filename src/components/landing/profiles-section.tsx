import Link from "next/link";
import { Flame } from "lucide-react";
import { HeatmapMini } from "@/components/landing/heatmap-mini";
import { PROFILES, generateHeatCells } from "@/components/landing/data";
import { getDict } from "@/components/landing/i18n";
import { eyebrow } from "@/components/landing/styles";

/**
 * Social proof sin testimonios: perfiles públicos con datos en vivo,
 * como tarjetas de usuario de GitHub.
 */
export async function ProfilesSection() {
  const t = await getDict();
  return (
    <section className="border-t border-[#27272A]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className={eyebrow}>{t.profiles.eyebrow}</p>
        <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-[#FAFAFA] md:text-[36px]">
          {t.profiles.title}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#A1A1AA]">
          {t.profiles.body}
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PROFILES.map((p) => (
            <div
              key={p.handle}
              className="rounded-lg border border-[#27272A] bg-[#111113] p-5 transition-colors hover:border-[#3F3F46]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-[#27272A] bg-[#1C1C1F] font-mono text-[11px] text-[#A1A1AA]">
                  {p.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium text-[#FAFAFA]">
                    {p.name}
                  </p>
                  <p className="font-mono text-[11px] text-[#52525B]">
                    @{p.handle}
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden">
                <HeatmapMini
                  cells={generateHeatCells(32, p.seed)}
                  cellSize={6}
                  gap={2}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { value: p.commits, label: t.profiles.stats.commits },
                  { value: p.hours, label: t.profiles.stats.coded },
                  { value: p.problems, label: t.profiles.stats.problems },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-mono text-[15px] font-semibold tabular-nums text-[#FAFAFA]">
                      {s.value}
                    </p>
                    <p className="font-mono text-[10px] text-[#52525B]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-1.5 border-t border-[#1C1C1F] pt-3">
                <Flame className="size-3 text-[#F59E0B]" />
                <span className="font-mono text-[11px] text-[#A1A1AA]">
                  {t.profiles.streak.replace("{n}", String(p.streak))}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[12px] text-[#52525B]">
          {t.profiles.footerPre}{" "}
          <Link
            href="/u/ada"
            className="font-mono text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
          >
            devdash.app/u/ada
          </Link>
        </p>
      </div>
    </section>
  );
}
