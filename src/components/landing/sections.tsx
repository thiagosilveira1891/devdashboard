import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const REPO_URL = "https://github.com/thiago/devdashboard";

const ROWS = [
  { feature: "Commits", gh: true, lc: false, wt: false, dd: true },
  { feature: "Coding hours", gh: false, lc: false, wt: true, dd: true },
  { feature: "Problems solved", gh: false, lc: true, wt: false, dd: true },
  { feature: "Rating evolution", gh: false, lc: true, wt: false, dd: true },
  { feature: "Language stats", gh: false, lc: false, wt: true, dd: true },
  { feature: "Unified heatmap", gh: false, lc: false, wt: false, dd: true },
  { feature: "Period comparison", gh: false, lc: false, wt: false, dd: true },
  { feature: "Public profile", gh: true, lc: false, wt: false, dd: true },
  { feature: "History forever", gh: false, lc: false, wt: false, dd: true },
  { feature: "Open source", gh: false, lc: false, wt: false, dd: true },
];

const PLATFORM_COLS = [
  { key: "gh", label: "GitHub", color: "#fafafa" },
  { key: "lc", label: "LeetCode", color: "#f59e0b" },
  { key: "wt", label: "WakaTime", color: "#7c3aed" },
  { key: "dd", label: "DevDash", color: "#22c55e" },
] as const;

export function ComparisonSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#27272a]">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#fafafa]">
          Why DevDash?
        </h2>
        <p className="text-[14px] text-[#a1a1aa] mt-3">
          Each platform shows a piece. DevDash shows everything.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#27272a]">
              <th className="text-left py-3 font-medium text-[#a1a1aa] w-[180px]">Feature</th>
              {PLATFORM_COLS.map((col) => (
                <th
                  key={col.key}
                  className="text-center py-3 font-medium w-[100px]"
                  style={{ color: col.color }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={i} className="border-b border-[#27272a]/50">
                <td className="py-2.5 text-[#fafafa]">{row.feature}</td>
                {PLATFORM_COLS.map((col) => (
                  <td key={col.key} className="text-center py-2.5">
                    {row[col.key as keyof typeof row] ? (
                      <span className="text-[#22c55e]">✓</span>
                    ) : (
                      <span className="text-[#27272a]">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-[#27272a] text-center">
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#fafafa]">
        Start tracking your entire
        <br />
        developer journey.
      </h2>
      <p className="text-[15px] text-[#a1a1aa] mt-4 max-w-md mx-auto">
        Open source. Self-hostable. Free forever.
      </p>
      <div className="flex items-center justify-center gap-3 mt-8">
        <Button asChild size="lg" className="h-10 px-6 text-[14px] bg-[#fafafa] text-[#09090b] hover:bg-[#e4e4e7] rounded-md font-medium">
          <Link href="/dashboard">
            Get Started
            <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-10 px-6 text-[14px] border-[#27272a] text-[#fafafa] hover:bg-[#111113] rounded-md">
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            View GitHub
            <ExternalLink className="size-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-[#27272a]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 text-[12px]">
          <span className="text-[#52525b]">DevDash</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          >
            GitHub
          </a>
          <Link href="/docs/self-hosting" className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
            Documentation
          </Link>
          <span className="text-[#a1a1aa]">Self Host</span>
          <span className="text-[#a1a1aa]">Privacy</span>
        </div>
        <span className="text-[11px] text-[#52525b] border border-[#27272a] rounded px-2 py-0.5">
          AGPL-3.0
        </span>
      </div>
    </footer>
  );
}
