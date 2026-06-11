import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { auth } from "@/auth";
import { addDays } from "@/lib/dates";
import { getDemoSnapshots } from "@/seed/demo-data";
import type { DaySnapshot, LanguageSeconds, Platform } from "@/lib/types";

export interface ComparisonRow {
  metric: string;
  current: number;
  previous: number;
  deltaPct: number | null;
  format: "number" | "hours" | "minutes";
}

export interface WeekdayBar {
  day: string;
  label: string;
  hours: number;
}

export interface AnalyticsData {
  comparison: {
    current: ComparisonRow[];
    previous: ComparisonRow[];
  };
  weekdayActivity: WeekdayBar[];
  insights: string[];
}

const PLATFORM_FROM_DB: Record<string, Platform> = {
  GITHUB: "github",
  WAKATIME: "wakatime",
  LEETCODE: "leetcode",
  CODEFORCES: "codeforces",
};

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

async function getRealSnapshots(
  userId: string,
  days: number,
): Promise<DaySnapshot[]> {
  const db = getDb();
  const rows = await db.dailySnapshot.findMany({
    where: { userId, date: { gte: addDays(new Date(), -(days * 2)) } },
    orderBy: { date: "asc" },
  });
  return rows.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    platform: PLATFORM_FROM_DB[row.platform],
    commits: row.commits ?? undefined,
    codingSeconds: row.codingSeconds ?? undefined,
    languages: (row.languages as LanguageSeconds[] | null) ?? undefined,
    cfSubmissions: row.cfSubmissions ?? undefined,
    problemsSolvedTotal: row.problemsSolvedTotal ?? undefined,
  }));
}

function computeComparison(
  snapshots: DaySnapshot[],
  rangeDays: number,
): { current: ComparisonRow[]; previous: ComparisonRow[] } {
  const now = new Date();
  const currentStart = addDays(now, -(rangeDays - 1));
  const previousStart = addDays(currentStart, -rangeDays);

  const inRange = (s: DaySnapshot, start: Date, end: Date) => {
    const d = new Date(s.date);
    return d >= start && d <= end;
  };

  let curCommits = 0;
  let curCoding = 0;
  let curProblems = 0;
  let curSubmissions = 0;
  let prevCommits = 0;
  let prevCoding = 0;
  let prevProblems = 0;
  let prevSubmissions = 0;

  const prevGauges = new Map<string, number>();
  const curGauges = new Map<string, number>();

  for (const s of snapshots) {
    if (inRange(s, currentStart, now)) {
      curCommits += s.commits ?? 0;
      curCoding += s.codingSeconds ?? 0;
      curSubmissions += s.cfSubmissions ?? 0;
      if (s.platform === "leetcode" || s.platform === "codeforces") {
        const key = `${s.platform}:${s.date}`;
        curGauges.set(key, s.problemsSolvedTotal ?? 0);
      }
    } else if (inRange(s, previousStart, currentStart)) {
      prevCommits += s.commits ?? 0;
      prevCoding += s.codingSeconds ?? 0;
      prevSubmissions += s.cfSubmissions ?? 0;
      if (s.platform === "leetcode" || s.platform === "codeforces") {
        const key = `${s.platform}:${s.date}`;
        prevGauges.set(key, s.problemsSolvedTotal ?? 0);
      }
    }
  }

  // Problems: estimate from gauge deltas
  const gaugeDelta = (m: Map<string, number>, prefix: string): number => {
    const entries = [...m.entries()]
      .filter(([k]) => k.startsWith(prefix))
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (entries.length < 2) return 0;
    return Math.max(0, entries[entries.length - 1][1] - entries[0][1]);
  };
  curProblems = gaugeDelta(curGauges, "leetcode") + gaugeDelta(curGauges, "codeforces");
  prevProblems = gaugeDelta(prevGauges, "leetcode") + gaugeDelta(prevGauges, "codeforces");

  const pct = (cur: number, prev: number): number | null => {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 100);
  };

  const rows: ComparisonRow[] = [
    { metric: "Commits", current: curCommits, previous: prevCommits, deltaPct: pct(curCommits, prevCommits), format: "number" },
    { metric: "Horas programadas", current: curCoding, previous: prevCoding, deltaPct: pct(curCoding, prevCoding), format: "hours" },
    { metric: "Problemas", current: curProblems, previous: prevProblems, deltaPct: pct(curProblems, prevProblems), format: "number" },
    { metric: "Submissions CF", current: curSubmissions, previous: prevSubmissions, deltaPct: pct(curSubmissions, prevSubmissions), format: "number" },
  ];

  return { current: rows, previous: rows };
}

function computeWeekdayActivity(snapshots: DaySnapshot[]): WeekdayBar[] {
  const hours = new Array(7).fill(0);
  const counts = new Array(7).fill(0);

  for (const s of snapshots) {
    const d = new Date(s.date);
    const dow = d.getDay();
    const secs = s.codingSeconds ?? 0;
    if (secs > 0) {
      hours[dow] += secs;
      counts[dow]++;
    }
  }

  return DAY_LABELS.map((label, i) => ({
    day: label,
    label,
    hours: counts[i] > 0 ? Math.round((hours[i] / counts[i] / 3600) * 10) / 10 : 0,
  }));
}

function computeInsights(
  snapshots: DaySnapshot[],
  comparison: ComparisonRow[],
): string[] {
  const insights: string[] = [];
  const hoursRow = comparison.find((r) => r.metric === "Horas programadas");
  if (hoursRow && hoursRow.deltaPct !== null && hoursRow.deltaPct >= 20) {
    insights.push(`📈 Tu tiempo programando subió ${hoursRow.deltaPct}% respecto al período anterior.`);
  } else if (hoursRow && hoursRow.deltaPct !== null && hoursRow.deltaPct <= -20) {
    insights.push(`📉 Tu tiempo programando bajó ${Math.abs(hoursRow.deltaPct)}% — ¿semana de descanso?`);
  }

  const weekday = computeWeekdayActivity(snapshots);
  const maxDay = weekday.reduce((max, d) => (d.hours > max.hours ? d : max), weekday[0]);
  const minDay = weekday.reduce((min, d) => (d.hours < min.hours ? d : min), weekday[0]);
  if (maxDay.hours > 0 && maxDay.hours >= minDay.hours * 2) {
    insights.push(`📊 Tu día más productivo es el ${maxDay.label} (${maxDay.hours}h de media) vs ${minDay.label} (${minDay.hours}h).`);
  }

  const langSnapshot = snapshots.find((s) => s.languages?.length);
  if (langSnapshot?.languages?.length) {
    const top = langSnapshot.languages.slice(0, 2).map((l) => l.name).join(" y ");
    insights.push(`💻 Tus lenguajes principales: ${top}.`);
  }

  if (insights.length === 0) {
    insights.push("Sincroniza más plataformas para recibir insights personalizados.");
  }

  return insights;
}

export async function getAnalyticsData(rangeDays: number): Promise<AnalyticsData> {
  let snapshots: DaySnapshot[];

  if (isDemoMode()) {
    snapshots = getDemoSnapshots().filter((s) =>
      ["github", "wakatime", "leetcode", "codeforces"].includes(s.platform),
    );
  } else {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Sin sesión");
    snapshots = await getRealSnapshots(userId, rangeDays);
  }

  const comparison = computeComparison(snapshots, rangeDays);
  const weekdayActivity = computeWeekdayActivity(snapshots);
  const insights = computeInsights(snapshots, comparison.current);

  return { comparison, weekdayActivity, insights };
}
