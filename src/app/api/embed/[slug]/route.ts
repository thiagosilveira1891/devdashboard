import { NextResponse } from "next/server";
import { getProfileData } from "@/app/u/[slug]/profile-data";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`embed:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const { slug } = await params;
  const data = await getProfileData(slug);
  if (!data) {
    return new NextResponse("Not found", { status: 404 });
  }

  const W = 480;
  const H = 200;
  const CARD_BG = "#0A0A0B";
  const CARD_FG = "#FAFAFA";
  const MUTED = "#A1A1AA";
  const BORDER = "#26262B";
  const HEAT_COLORS = ["#161618", "#312e5e", "#4644a8", "#6366f1", "#a5b4fc"];

  const stats: [string, string][] = [
    ["Commits", formatCompact(data.stats.commitsYear)],
    ["Horas", formatCompactHours(data.stats.hoursYear)],
    ["Problemas", String(data.stats.problemsTotal)],
    ["Rating", data.stats.cfRating ? String(data.stats.cfRating) : "—"],
    ["Racha", `${data.stats.longestStreak}d`],
  ];

  const heatCells = data.heatmap.slice(-84);
  const cellW = 10;
  const cellGap = 3;
  const cols = 7;
  const heatX = 228;
  const heatY = 52;

  function formatCompact(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  }

  function formatCompactHours(seconds: number): string {
    const h = Math.round(seconds / 3600);
    if (h >= 1000) return `${(h / 1000).toFixed(1)}k`;
    return `${h}h`;
  }

  function escapeXml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="8" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
  
  <text x="16" y="24" font-family="Geist, sans-serif" font-size="10" fill="${MUTED}">${escapeXml(data.name)} · @${escapeXml(data.username)}</text>
  
  ${stats.map(([label, value], i) => {
    const x = 16 + i * 88;
    const y = 38;
    return `<text x="${x}" y="${y}" font-family="monospace" font-size="9" fill="${MUTED}">${label}</text>
  <text x="${x}" y="${y + 12}" font-family="monospace" font-size="13" fill="${CARD_FG}" font-weight="600">${value}</text>`;
  }).join("\n  ")}
  
  ${heatCells.map((cell, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = heatX + col * (cellW + cellGap);
    const y = heatY + row * (cellW + cellGap);
    return `<rect x="${x}" y="${y}" width="${cellW}" height="${cellW}" rx="2" fill="${HEAT_COLORS[cell.level]}" opacity="${cell.level === 0 ? 0.3 : 1}"/>`;
  }).join("\n  ")}
  
  <text x="228" y="46" font-family="Geist, sans-serif" font-size="8" fill="${MUTED}">últimas 12 semanas</text>
  
  <text x="${W - 16}" y="${H - 10}" font-family="Geist, sans-serif" font-size="8" fill="${MUTED}" text-anchor="end">devdash.app/u/${escapeXml(slug)}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600, s-maxage=7200",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
