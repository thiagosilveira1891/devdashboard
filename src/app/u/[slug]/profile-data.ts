import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { addDays } from "@/lib/dates";
import { getDemoSnapshots, DEMO_USER } from "@/seed/demo-data";
import type {
  DaySnapshot,
  LanguageSeconds,
  LanguageShare,
  Platform,
  RatingPoint,
  HeatmapCell,
} from "@/lib/types";
import {
  fromDateKey,
  lastNDateKeys,
  toDateKey,
} from "@/lib/dates";

export interface ProfileData {
  name: string;
  username: string;
  image?: string;
  isDemo: boolean;
  stats: {
    commitsYear: number;
    hoursYear: number;
    problemsTotal: number;
    cfRating: number | null;
    cfRank: string | null;
    cfMaxRating: number | null;
    longestStreak: number;
  };
  heatmap: HeatmapCell[];
  languages: LanguageShare[];
  rating: { codeforces: RatingPoint[] };
  connected: string[];
}

const PLATFORM_FROM_DB: Record<string, Platform> = {
  GITHUB: "github",
  WAKATIME: "wakatime",
  LEETCODE: "leetcode",
  CODEFORCES: "codeforces",
};

type DayIndex = Map<string, Partial<Record<Platform, DaySnapshot>>>;

function indexByDate(snapshots: DaySnapshot[]): DayIndex {
  const index: DayIndex = new Map();
  for (const snap of snapshots) {
    let day = index.get(snap.date);
    if (!day) {
      day = {};
      index.set(snap.date, day);
    }
    day[snap.platform] = snap;
  }
  return index;
}

function pickCommits(i: DayIndex, k: string) {
  return i.get(k)?.github?.commits ?? 0;
}

function pickCoding(i: DayIndex, k: string) {
  return i.get(k)?.wakatime?.codingSeconds ?? 0;
}

function problemsSolvedOn(i: DayIndex, key: string): number {
  const day = i.get(key);
  if (!day) return 0;
  const prevKey = toDateKey(
    new Date(fromDateKey(key).getTime() - 24 * 3600 * 1000),
  );
  const prev = i.get(prevKey);
  let solved = 0;
  const lcNow = day.leetcode?.problemsSolvedTotal;
  const lcPrev = prev?.leetcode?.problemsSolvedTotal;
  if (lcNow !== undefined && lcPrev !== undefined)
    solved += Math.max(0, lcNow - lcPrev);
  const cfNow = day.codeforces?.cfProblemsSolvedTotal;
  const cfPrev = prev?.codeforces?.cfProblemsSolvedTotal;
  if (cfNow !== undefined && cfPrev !== undefined)
    solved += Math.max(0, cfNow - cfPrev);
  return solved;
}

function isActiveDay(i: DayIndex, key: string): boolean {
  const day = i.get(key);
  if (!day) return false;
  if ((day.github?.commits ?? 0) >= 1) return true;
  if ((day.wakatime?.codingSeconds ?? 0) >= 1800) return true;
  if ((day.codeforces?.cfSubmissions ?? 0) >= 1) return true;
  return problemsSolvedOn(i, key) >= 1;
}

export async function getProfileData(
  slug: string,
): Promise<ProfileData | null> {
  if (isDemoMode()) {
    if (slug !== "ada") return null;
    const snapshots = getDemoSnapshots();
    return buildProfileData(snapshots, {
      name: DEMO_USER.name,
      username: DEMO_USER.username,
      isDemo: true,
      connected: ["github", "wakatime", "leetcode", "codeforces"],
    });
  }

  const db = getDb();
  const profile = await db.publicProfile.findUnique({
    where: { slug },
    include: { user: true },
  });
  if (!profile || !profile.isPublic) return null;

  const userId = profile.userId;
  const [gh, wt, lc, cf, userRows] = await Promise.all([
    db.githubAccount.findUnique({ where: { userId } }),
    db.wakatimeAccount.findUnique({ where: { userId } }),
    db.leetcodeAccount.findUnique({ where: { userId } }),
    db.codeforcesAccount.findUnique({ where: { userId } }),
    db.dailySnapshot.findMany({
      where: { userId, date: { gte: addDays(new Date(), -370) } },
      orderBy: { date: "asc" },
    }),
  ]);

  const snapshots: DaySnapshot[] = userRows.map((row) => ({
    date: row.date.toISOString().slice(0, 10),
    platform: PLATFORM_FROM_DB[row.platform],
    commits: row.commits ?? undefined,
    codingSeconds: row.codingSeconds ?? undefined,
    languages: (row.languages as LanguageSeconds[] | null) ?? undefined,
    problemsSolvedTotal: row.problemsSolvedTotal ?? undefined,
    solvedEasy: row.solvedEasy ?? undefined,
    solvedMedium: row.solvedMedium ?? undefined,
    solvedHard: row.solvedHard ?? undefined,
    contestRating: row.contestRating ?? undefined,
    cfRating: row.cfRating ?? undefined,
    cfMaxRating: row.cfMaxRating ?? undefined,
    cfRank: row.cfRank ?? undefined,
    cfProblemsSolvedTotal: row.cfProblemsSolvedTotal ?? undefined,
    cfSubmissions: row.cfSubmissions ?? undefined,
  }));

  const connected: string[] = [];
  if (gh && profile.showGithub) connected.push("github");
  if (wt && profile.showWakatime) connected.push("wakatime");
  if (lc && profile.showLeetcode) connected.push("leetcode");
  if (cf && profile.showCodeforces) connected.push("codeforces");

  return buildProfileData(snapshots, {
    name: profile.user.name ?? gh?.login ?? "Developer",
    username: profile.slug,
    image: profile.user.image ?? gh?.avatarUrl ?? undefined,
    isDemo: false,
    connected,
  });
}

function buildProfileData(
  snapshots: DaySnapshot[],
  user: { name: string; username: string; image?: string; isDemo: boolean; connected: string[] },
): ProfileData {
  const index = indexByDate(snapshots);
  const yearKeys = lastNDateKeys(365);

  // --- Stats ---
  let commitsYear = 0;
  let hoursYear = 0;
  for (const k of yearKeys) {
    commitsYear += pickCommits(index, k);
    hoursYear += pickCoding(index, k);
  }

  const latestLc = [...yearKeys]
    .reverse()
    .map((k) => index.get(k)?.leetcode)
    .find((s) => s?.problemsSolvedTotal !== undefined);
  const problemsTotal = latestLc?.problemsSolvedTotal ?? 0;
  const cfSolved = [...yearKeys]
    .reverse()
    .map((k) => index.get(k)?.codeforces?.cfProblemsSolvedTotal)
    .find((s) => s !== undefined) ?? 0;

  const latestCf = [...yearKeys]
    .reverse()
    .map((k) => index.get(k)?.codeforces)
    .find((s) => s?.cfRating !== undefined);

  let longestStreak = 0;
  let run = 0;
  for (const k of yearKeys) {
    if (isActiveDay(index, k)) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  // --- Heatmap ---
  const rawScores = yearKeys.map((k) => {
    const commits = pickCommits(index, k);
    const codingSeconds = pickCoding(index, k);
    const problems = problemsSolvedOn(index, k);
    const score = commits + (codingSeconds / 3600) * 1.5 + problems * 2;
    return { date: k, commits, codingSeconds, problems, score };
  });
  const nonZero = rawScores
    .map((s) => s.score)
    .filter((s) => s > 0)
    .sort((a, b) => a - b);
  const q = (p: number) =>
    nonZero.length ? nonZero[Math.floor(p * (nonZero.length - 1))] : 0;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  const heatmap: HeatmapCell[] = rawScores.map((s) => ({
    date: s.date,
    commits: s.commits,
    codingSeconds: s.codingSeconds,
    problems: s.problems,
    level: s.score === 0 ? 0 : s.score <= q1 ? 1 : s.score <= q2 ? 2 : s.score <= q3 ? 3 : 4,
  }));

  // --- Languages ---
  const langTotals = new Map<string, number>();
  for (const k of yearKeys) {
    for (const lang of index.get(k)?.wakatime?.languages ?? []) {
      langTotals.set(lang.name, (langTotals.get(lang.name) ?? 0) + lang.seconds);
    }
  }
  const langTotal = [...langTotals.values()].reduce((s, v) => s + v, 0);
  const languages: LanguageShare[] = [...langTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, seconds]) => ({
      name,
      seconds,
      pct: langTotal ? Math.round((seconds / langTotal) * 100) : 0,
    }));

  // --- Rating ---
  const codeforces: RatingPoint[] = [];
  let lastRating: number | undefined;
  for (const k of yearKeys) {
    const r = index.get(k)?.codeforces?.cfRating;
    if (r !== undefined && r !== lastRating) {
      codeforces.push({ date: k, rating: r });
      lastRating = r;
    }
  }

  return {
    name: user.name,
    username: user.username,
    image: user.image,
    isDemo: user.isDemo,
    stats: {
      commitsYear,
      hoursYear,
      problemsTotal: problemsTotal + cfSolved,
      cfRating: latestCf?.cfRating ?? null,
      cfRank: latestCf?.cfRank ?? null,
      cfMaxRating: latestCf?.cfMaxRating ?? null,
      longestStreak,
    },
    heatmap,
    languages,
    rating: { codeforces },
    connected: user.connected,
  };
}
