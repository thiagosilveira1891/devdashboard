import type { ReactNode } from "react";
import { HeatmapMini } from "@/components/landing/heatmap-mini";
import { Sparkline } from "@/components/landing/sparkline";
import {
  HEAT_COLORS,
  LANGUAGES,
  generateHeatCells,
  generateRatingSeries,
} from "@/components/landing/data";
import { getDict, type Dict } from "@/components/landing/i18n";
import { eyebrow } from "@/components/landing/styles";

/**
 * Filas alternadas estilo Linear: eyebrow mono, título, lista de specs con
 * marcador `+` (como un diff de git) y un preview realista del producto.
 */

const WEEK_THIS = [38, 72, 55, 88, 64, 22, 12];
const WEEK_LAST = [30, 48, 60, 52, 40, 30, 18];

function WeeklyChart() {
  const w = 260;
  const h = 96;
  const px = (i: number) => 8 + (i / 6) * (w - 16);
  const py = (v: number) => h - 8 - (v / 100) * (h - 16);
  const path = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)} ${py(v)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="block w-full" aria-hidden>
        {[25, 50, 75].map((y) => (
          <line
            key={y}
            x1={8}
            x2={w - 8}
            y1={py(y)}
            y2={py(y)}
            stroke="#1C1C1F"
            strokeWidth={1}
          />
        ))}
        <path
          d={path(WEEK_LAST)}
          fill="none"
          stroke="#3F3F46"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <path d={path(WEEK_THIS)} fill="none" stroke="#6366F1" strokeWidth={1.5} />
        <circle cx={px(6)} cy={py(WEEK_THIS[6])} r={2.5} fill="#6366F1" />
      </svg>
      <div className="mt-1 flex justify-between px-1 font-mono text-[9px] text-[#52525B]">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
    </div>
  );
}

type FeaturePreview = {
  key: keyof Dict["features"]["items"];
  id?: string;
  preview: ReactNode;
};

const FEATURE_PREVIEWS: FeaturePreview[] = [
  {
    key: "timeline",
    preview: (
      <div className="rounded-lg border border-[#27272A] bg-[#111113] p-4">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {["All", "GitHub", "LeetCode", "Codeforces", "WakaTime"].map((f, i) => (
            <span
              key={f}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                i === 0
                  ? "border-[#6366F1]/50 bg-[#6366F1]/10 text-[#E4E4E7]"
                  : "border-[#27272A] text-[#52525B]"
              }`}
            >
              {f}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <HeatmapMini cells={generateHeatCells(36, 13)} cellSize={10} gap={3} interactive />
        </div>
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[9px] text-[#52525B]">
          <span>less</span>
          {HEAT_COLORS.map((c) => (
            <span
              key={c}
              className="size-[9px] rounded-[2px]"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>more</span>
          <span className="ml-auto">36 weeks · all platforms</span>
        </div>
      </div>
    ),
  },
  {
    key: "analytics",
    id: "analytics",
    preview: (
      <div className="rounded-lg border border-[#27272A] bg-[#111113] p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-[11px] font-medium text-[#A1A1AA]">
            This week vs last week
          </p>
          <p className="font-mono text-[10px] text-[#22C55E]">▲ +34%</p>
        </div>
        <WeeklyChart />
        <div className="mt-4 space-y-1.5 border-t border-[#1C1C1F] pt-3">
          {[
            "Most productive day: Thursday",
            "Longest session: 3h 12m · Tuesday",
            "Streak at risk after 9pm — 47 days on the line",
          ].map((line) => (
            <p key={line} className="flex gap-2 text-[12px] text-[#A1A1AA]">
              <span className="font-mono text-[#6366F1]">›</span>
              {line}
            </p>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "languages",
    preview: (
      <div className="rounded-lg border border-[#27272A] bg-[#111113] p-4">
        <div className="flex h-2 overflow-hidden rounded-full">
          {LANGUAGES.map((l) => (
            <div
              key={l.name}
              style={{ width: `${l.pct}%`, backgroundColor: l.color }}
            />
          ))}
        </div>
        <div className="mt-4 space-y-2.5">
          {LANGUAGES.map((l) => (
            <div key={l.name} className="flex items-center gap-3">
              <span
                className="size-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: l.color }}
                aria-hidden
              />
              <span className="w-24 truncate text-[12px] text-[#E4E4E7]">
                {l.name}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1C1C1F]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                />
              </div>
              <span className="w-12 text-right font-mono text-[10px] tabular-nums text-[#52525B]">
                {l.hours}
              </span>
              <span className="w-9 text-right font-mono text-[11px] tabular-nums text-[#A1A1AA]">
                {l.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "competitive",
    preview: (
      <div className="grid gap-3 rounded-lg border border-[#27272A] bg-[#111113] p-4 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#F59E0B]" aria-hidden />
            <p className="text-[11px] font-medium text-[#A1A1AA]">LeetCode</p>
          </div>
          <p className="mt-2 font-mono text-[22px] font-semibold tabular-nums leading-none text-[#FAFAFA]">
            440
            <span className="ml-1.5 text-[10px] font-normal text-[#52525B]">
              solved
            </span>
          </p>
          <div className="mt-3 space-y-2">
            {[
              { label: "Easy", value: 167, max: 250, color: "#22C55E" },
              { label: "Medium", value: 242, max: 250, color: "#F59E0B" },
              { label: "Hard", value: 31, max: 250, color: "#EF4444" },
            ].map((d) => (
              <div key={d.label} className="flex items-center gap-2">
                <span className="w-14 text-[11px] text-[#A1A1AA]">{d.label}</span>
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1C1C1F]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.value / d.max) * 100}%`,
                      backgroundColor: d.color,
                    }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[10px] tabular-nums text-[#52525B]">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-[#1C1C1F] pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#38BDF8]" aria-hidden />
            <p className="text-[11px] font-medium text-[#A1A1AA]">Codeforces</p>
          </div>
          <p className="mt-2 font-mono text-[22px] font-semibold tabular-nums leading-none text-[#38BDF8]">
            1,612
            <span className="ml-1.5 text-[10px] font-normal">Expert</span>
          </p>
          <div className="mt-3 h-12">
            <Sparkline
              data={generateRatingSeries(24, 3)}
              width={200}
              height={48}
              stroke="#38BDF8"
            />
          </div>
          <p className="mt-2 font-mono text-[10px] text-[#52525B]">
            last contest <span className="text-[#22C55E]">+42</span>
          </p>
        </div>
      </div>
    ),
  },
];

export async function FeaturesSection() {
  const t = await getDict();
  return (
    <section id="features" className="border-t border-[#27272A]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className={eyebrow}>{t.features.eyebrow}</p>
        <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-[#FAFAFA] md:text-[36px]">
          {t.features.title}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#A1A1AA]">
          {t.features.body}
        </p>

        <div className="mt-20 space-y-24">
          {FEATURE_PREVIEWS.map((feature, i) => {
            const copy = t.features.items[feature.key];
            return (
              <div
                key={feature.key}
                id={feature.id}
                className="grid grid-cols-1 items-center gap-10 scroll-mt-24 lg:grid-cols-2 lg:gap-16"
              >
                <div className={`min-w-0 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <p className={eyebrow}>{copy.label}</p>
                  <h3 className="mt-3 text-[22px] font-semibold tracking-tight text-[#FAFAFA] md:text-[26px]">
                    {copy.title}
                  </h3>
                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-[#A1A1AA]">
                    {copy.description}
                  </p>
                  <ul className="mt-5 space-y-2">
                    {copy.specs.map((spec) => (
                      <li
                        key={spec}
                        className="flex gap-2.5 text-[13px] text-[#A1A1AA]"
                      >
                        <span className="font-mono text-[#22C55E]" aria-hidden>
                          +
                        </span>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`min-w-0 ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                  {feature.preview}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
