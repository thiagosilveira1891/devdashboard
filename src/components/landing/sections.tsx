import Link from "next/link";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { HeatmapMini } from "@/components/landing/heatmap-mini";
import { LogoMark } from "@/components/landing/logo";
import { REPO_URL, generateHeatCells } from "@/components/landing/data";
import { btnPrimary, btnSecondary, eyebrow } from "@/components/landing/styles";

/* ============================== Comparison ============================== */

const COLUMNS = [
  { key: "gh", label: "GitHub" },
  { key: "lc", label: "LeetCode" },
  { key: "wt", label: "WakaTime" },
  { key: "dd", label: "DevDash" },
] as const;

const ROWS: { feature: string; gh: boolean; lc: boolean; wt: boolean; dd: boolean }[] = [
  { feature: "Commits", gh: true, lc: false, wt: false, dd: true },
  { feature: "Coding hours", gh: false, lc: false, wt: true, dd: true },
  { feature: "Problems solved", gh: false, lc: true, wt: false, dd: true },
  { feature: "Contest rating", gh: false, lc: true, wt: false, dd: true },
  { feature: "Language stats", gh: true, lc: false, wt: true, dd: true },
  { feature: "Streaks", gh: false, lc: true, wt: false, dd: true },
  { feature: "Unified timeline", gh: false, lc: false, wt: false, dd: true },
  { feature: "Self-hosted, open source", gh: false, lc: false, wt: false, dd: true },
];

export function ComparisonSection() {
  return (
    <section className="border-t border-[#27272A]">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <p className={eyebrow}>COMPARE</p>
        <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-[#FAFAFA] md:text-[36px]">
          One tool instead of four tabs.
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-[#A1A1AA]">
          Each platform tracks a slice. DevDash tracks the developer.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#27272A]">
                <th className="w-[220px] py-3 text-left font-mono text-[11px] font-medium tracking-[0.08em] text-[#52525B]">
                  FEATURE
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`w-[110px] py-3 text-center text-[13px] font-medium ${
                      col.key === "dd"
                        ? "bg-[#6366F1]/[0.06] text-[#FAFAFA]"
                        : "text-[#A1A1AA]"
                    }`}
                  >
                    {col.key === "dd" ? (
                      <span className="inline-flex items-center gap-2">
                        <LogoMark size={12} />
                        {col.label}
                      </span>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-b border-[#27272A]/50">
                  <td className="py-3 text-[#E4E4E7]">{row.feature}</td>
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 text-center ${
                        col.key === "dd" ? "bg-[#6366F1]/[0.06]" : ""
                      }`}
                    >
                      {row[col.key] ? (
                        <Check
                          className={`mx-auto size-3.5 ${
                            col.key === "dd" ? "text-[#22C55E]" : "text-[#A1A1AA]"
                          }`}
                          aria-label="yes"
                        />
                      ) : (
                        <span className="text-[#3F3F46]" aria-label="no">
                          –
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ================================= CTA ================================= */

export function CTASection() {
  return (
    <section className="relative overflow-hidden border-t border-[#27272A]">
      {/* Muro de contribuciones desvanecido tras el titular */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20"
        style={{
          maskImage:
            "radial-gradient(ellipse 55% 65% at 50% 50%, black, transparent)",
        }}
      >
        <HeatmapMini cells={generateHeatCells(64, 21)} cellSize={12} gap={3} />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-28 text-center">
        <h2 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-[#FAFAFA] md:text-[40px]">
          Start tracking your entire
          <br />
          developer journey.
        </h2>
        <p className="mt-4 text-[14px] text-[#A1A1AA]">
          Free and open source. Connect your accounts in five minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard" className={`${btnPrimary} h-10`}>
            Get Started
            <ArrowRight className="size-4" />
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={`${btnSecondary} h-10`}
          >
            View GitHub
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ================================ Footer ================================ */

const FOOTER_LINKS = [
  { label: "GitHub", href: REPO_URL, external: true },
  { label: "Documentation", href: "/docs/self-hosting", external: false },
  { label: "Self Host", href: "/docs/self-hosting", external: false },
  { label: "Privacy", href: "/privacy", external: false },
];

export function Footer() {
  return (
    <footer className="border-t border-[#27272A]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoMark size={14} />
          <span className="text-[13px] text-[#A1A1AA]">DevDash</span>
          <span className="font-mono text-[11px] text-[#52525B]">© 2026</span>
        </div>

        <nav className="flex items-center gap-6">
          {FOOTER_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-[12px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-[12px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <span className="rounded border border-[#27272A] px-2 py-0.5 font-mono text-[11px] text-[#52525B]">
          AGPL-3.0
        </span>
      </div>
    </footer>
  );
}
