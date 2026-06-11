import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { getProfileData } from "@/app/u/[slug]/profile-data";
import { formatHours, formatNumber } from "@/lib/format";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`og:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }
  const { slug } = await params;
  const data = await getProfileData(slug);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const stats: [string, string][] = [
    ["Commits", formatNumber(data.stats.commitsYear)],
    ["Horas", formatHours(data.stats.hoursYear)],
    ["Problemas", String(data.stats.problemsTotal)],
    [
      "Rating",
      data.stats.cfRating ? String(data.stats.cfRating) : "—",
    ],
    ["Racha", `${data.stats.longestStreak}d`],
  ];

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1200,
        height: 630,
        background: "#0A0A0B",
        color: "#FAFAFA",
        fontFamily: "Geist, sans-serif",
        padding: 60,
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {data.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image}
            alt=""
            width={72}
            height={72}
            style={{ borderRadius: "50%", border: "2px solid #26262B" }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.15)",
              border: "2px solid rgba(99,102,241,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#6366F1",
            }}
          >
            {data.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.5px" }}>
            {data.name}
          </div>
          <div style={{ fontSize: 20, color: "#A1A1AA", fontFamily: "monospace" }}>
            @{data.username}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
        {stats.map(([label, value]) => (
          <div
            key={label}
            style={{
              flex: 1,
              background: "#111113",
              borderRadius: 12,
              border: "1px solid #26262B",
              padding: "20px 24px",
            }}
          >
            <div style={{ fontSize: 13, color: "#52525B", textTransform: "uppercase", letterSpacing: "1px" }}>
              {label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 6 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Platforms & footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 32 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {data.connected.map((p) => (
            <div
              key={p}
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: 20,
                background: "rgba(99,102,241,0.12)",
                color: "#A5B4FC",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              {p === "github" ? "GitHub" : p === "wakatime" ? "WakaTime" : p === "leetcode" ? "LeetCode" : "Codeforces"}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6366F1", fontSize: 14, fontWeight: 500 }}>
          developer dashboard
          <div style={{ width: 20, height: 20, background: "rgba(99,102,241,0.15)", borderRadius: 6, border: "1px solid rgba(99,102,241,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "monospace", fontWeight: 600, color: "#6366F1" }}>
            {"</>"}
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, immutable",
      },
    },
  );
}
