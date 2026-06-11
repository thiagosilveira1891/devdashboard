import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { getDemoSnapshots } from "@/seed/demo-data";
import { computeDashboardData } from "@/lib/data/compute";
import { WrappedSlides, type WrappedData } from "./wrapped-slides";

export const metadata: Metadata = { title: "Wrapped" };

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

async function computeWrapped(
  snapshots: Awaited<ReturnType<typeof getDemoSnapshots>>,
  isDemo: boolean,
): Promise<WrappedData> {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthSnapshots = snapshots.filter((s) => s.date.startsWith(monthPrefix));

  const fullData = computeDashboardData({
    snapshots,
    user: { name: "User", username: "user" },
    rangeDays: 30,
    connected: { github: true, wakatime: true, leetcode: true, codeforces: true },
    isDemo,
    lastSyncedAt: now.toISOString(),
  });

  let commits = 0;
  let codingSeconds = 0;
  let bestDayHours = 0;
  let bestDayDate = "";
  let activeDays = 0;
  const langTotals = new Map<string, number>();

  for (const s of monthSnapshots) {
    if (s.platform === "github") commits += s.commits ?? 0;
    if (s.platform === "wakatime") {
      const secs = s.codingSeconds ?? 0;
      codingSeconds += secs;
      if (secs / 3600 > bestDayHours) {
        bestDayHours = secs / 3600;
        bestDayDate = s.date;
      }
      for (const lang of s.languages ?? []) {
        langTotals.set(lang.name, (langTotals.get(lang.name) ?? 0) + lang.seconds);
      }
      if (secs >= 1800) activeDays++;
    }
  }

  const sortedSnaps = monthSnapshots
    .filter((s) => s.platform === "leetcode" || s.platform === "codeforces")
    .sort((a, b) => a.date.localeCompare(b.date));
  let problems = 0;
  let prevLc: number | undefined;
  let prevCf: number | undefined;
  for (const s of sortedSnaps) {
    if (s.platform === "leetcode" && s.problemsSolvedTotal !== undefined) {
      if (prevLc !== undefined) problems += Math.max(0, s.problemsSolvedTotal - prevLc);
      prevLc = s.problemsSolvedTotal;
    }
    if (s.platform === "codeforces" && s.cfProblemsSolvedTotal !== undefined) {
      if (prevCf !== undefined) problems += Math.max(0, s.cfProblemsSolvedTotal - prevCf);
      prevCf = s.cfProblemsSolvedTotal;
    }
  }

  const topLang = [...langTotals.entries()].sort((a, b) => b[1] - a[1])[0];
  const bestDayLabel = bestDayDate
    ? new Date(bestDayDate + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    : "";

  return {
    month: MONTHS[currentMonth],
    year: currentYear,
    commits,
    codingSeconds,
    problems,
    bestDayHours: Math.round(bestDayHours * 10) / 10,
    bestDayLabel,
    activeDays,
    topLang: topLang ? { name: topLang[0], hours: Math.round(topLang[1] / 3600) } : null,
    streak: fullData.streak,
    ccs: fullData.ccs,
    isDemo,
  };
}

export default async function WrappedPage() {
  let data: WrappedData;

  if (isDemoMode()) {
    data = await computeWrapped(getDemoSnapshots(), true);
  } else {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) redirect("/");

    const db = getDb();
    const rows = await db.dailySnapshot.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
    const PLATFORM_FROM_DB: Record<string, "github" | "wakatime" | "leetcode" | "codeforces"> = {
      GITHUB: "github",
      WAKATIME: "wakatime",
      LEETCODE: "leetcode",
      CODEFORCES: "codeforces",
    };
    const snapshots = rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      platform: PLATFORM_FROM_DB[row.platform],
      commits: row.commits ?? undefined,
      pullRequests: row.pullRequests ?? undefined,
      codingSeconds: row.codingSeconds ?? undefined,
      languages: (row.languages as { name: string; seconds: number }[] | null) ?? undefined,
      problemsSolvedTotal: row.problemsSolvedTotal ?? undefined,
      cfProblemsSolvedTotal: row.cfProblemsSolvedTotal ?? undefined,
      cfSubmissions: row.cfSubmissions ?? undefined,
    }));
    data = await computeWrapped(snapshots, false);
  }

  return <WrappedSlides data={data} />;
}
