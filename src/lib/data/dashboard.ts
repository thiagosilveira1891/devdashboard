import { auth } from "@/auth";
import { addDays } from "@/lib/dates";
import { getDb } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";
import type {
  DashboardData,
  DaySnapshot,
  LanguageSeconds,
  Platform,
  RangeDays,
} from "@/lib/types";
import { DEMO_USER, getDemoSnapshots } from "@/seed/demo-data";
import { computeDashboardData } from "./compute";

/**
 * Punto de entrada de datos del dashboard.
 * Demo: snapshots generados en memoria. Real: snapshots desde Postgres.
 * Ambos pasan por computeDashboardData — el mismo código de cálculo.
 */

const PLATFORM_FROM_DB: Record<string, Platform> = {
  GITHUB: "github",
  WAKATIME: "wakatime",
  LEETCODE: "leetcode",
  CODEFORCES: "codeforces",
};

function nn<T>(value: T | null): T | undefined {
  return value ?? undefined;
}

/** null = no hay sesión (la página debe redirigir al landing). */
export async function getDashboardData(
  rangeDays: RangeDays,
): Promise<DashboardData | null> {
  if (isDemoMode()) {
    return computeDashboardData({
      snapshots: getDemoSnapshots(),
      user: { ...DEMO_USER, profileSlug: "ada" },
      rangeDays,
      connected: {
        github: true,
        wakatime: true,
        leetcode: true,
        codeforces: true,
      },
      isDemo: true,
      lastSyncedAt: new Date().toISOString(),
    });
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const db = getDb();
  const [gh, wt, lc, cf, rows, dbUser] = await Promise.all([
    db.githubAccount.findUnique({ where: { userId } }),
    db.wakatimeAccount.findUnique({ where: { userId } }),
    db.leetcodeAccount.findUnique({ where: { userId } }),
    db.codeforcesAccount.findUnique({ where: { userId } }),
    db.dailySnapshot.findMany({
      where: { userId, date: { gte: addDays(new Date(), -370) } },
      orderBy: { date: "asc" },
    }),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  const snapshots: DaySnapshot[] = rows.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    platform: PLATFORM_FROM_DB[row.platform],
    commits: nn(row.commits),
    pullRequests: nn(row.pullRequests),
    prsMerged: nn(row.prsMerged),
    issuesOpened: nn(row.issuesOpened),
    reviews: nn(row.reviews),
    starsReceived: nn(row.starsReceived),
    totalRepos: nn(row.totalRepos),
    codingSeconds: nn(row.codingSeconds),
    topLanguage: nn(row.topLanguage),
    languages: (row.languages as LanguageSeconds[] | null) ?? undefined,
    problemsSolvedTotal: nn(row.problemsSolvedTotal),
    solvedEasy: nn(row.solvedEasy),
    solvedMedium: nn(row.solvedMedium),
    solvedHard: nn(row.solvedHard),
    contestRating: nn(row.contestRating),
    cfRating: nn(row.cfRating),
    cfMaxRating: nn(row.cfMaxRating),
    cfRank: nn(row.cfRank),
    cfProblemsSolvedTotal: nn(row.cfProblemsSolvedTotal),
    cfSubmissions: nn(row.cfSubmissions),
  }));

  const syncDates = [gh, wt, lc, cf]
    .map((a) => a?.lastSyncedAt)
    .filter((d): d is Date => !!d);

  const profileSlug =
    (await db.publicProfile.findUnique({
      where: { userId },
      select: { slug: true },
    }))?.slug ?? undefined;

  return computeDashboardData({
    snapshots,
    user: {
      name: dbUser?.name ?? gh?.login ?? "Developer",
      username: dbUser?.username ?? gh?.login ?? "dev",
      image: dbUser?.image ?? gh?.avatarUrl ?? undefined,
      profileSlug,
    },
    rangeDays,
    connected: { github: !!gh, wakatime: !!wt, leetcode: !!lc, codeforces: !!cf },
    isDemo: false,
    lastSyncedAt: syncDates.length
      ? new Date(Math.max(...syncDates.map((d) => d.getTime()))).toISOString()
      : null,
  });
}
