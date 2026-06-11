import { fromDateKey, isoWeekStart, lastNDateKeys, toDateKey } from "@/lib/dates";
import type {
  ActivityEvent,
  DashboardData,
  DashboardUser,
  DaySnapshot,
  HeatmapCell,
  KpiSeries,
  LanguageShare,
  Platform,
  RangeDays,
  RatingPoint,
  WeeklyHoursPoint,
} from "@/lib/types";

/**
 * Convierte snapshots diarios en los datos que pinta el dashboard.
 * Función pura: la usan por igual el modo demo y la lectura desde DB,
 * así que el modo demo ejercita exactamente el mismo código de cálculo.
 */

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

/** Problemas resueltos en un día = delta de los gauges respecto al día anterior. */
function problemsSolvedOn(index: DayIndex, dateKey: string): number {
  const day = index.get(dateKey);
  if (!day) return 0;
  const prevKey = toDateKey(
    new Date(fromDateKey(dateKey).getTime() - 24 * 3600 * 1000),
  );
  const prev = index.get(prevKey);

  let solved = 0;
  const lcNow = day.leetcode?.problemsSolvedTotal;
  const lcPrev = prev?.leetcode?.problemsSolvedTotal;
  if (lcNow !== undefined && lcPrev !== undefined) {
    solved += Math.max(0, lcNow - lcPrev);
  }
  const cfNow = day.codeforces?.cfProblemsSolvedTotal;
  const cfPrev = prev?.codeforces?.cfProblemsSolvedTotal;
  if (cfNow !== undefined && cfPrev !== undefined) {
    solved += Math.max(0, cfNow - cfPrev);
  }
  return solved;
}

/**
 * Día activo (PLANNING.md §9): ≥1 commit, ≥30 min programados,
 * ≥1 problema resuelto o ≥1 submission de Codeforces.
 */
function isActiveDay(index: DayIndex, dateKey: string): boolean {
  const day = index.get(dateKey);
  if (!day) return false;
  if ((day.github?.commits ?? 0) >= 1) return true;
  if ((day.wakatime?.codingSeconds ?? 0) >= 1800) return true;
  if ((day.codeforces?.cfSubmissions ?? 0) >= 1) return true;
  return problemsSolvedOn(index, dateKey) >= 1;
}

function buildKpi(daily: number[], prevTotal: number | null): KpiSeries {
  const value = daily.reduce((s, v) => s + v, 0);
  let deltaPct: number | null = null;
  if (prevTotal !== null && prevTotal > 0) {
    deltaPct = Math.round(((value - prevTotal) / prevTotal) * 100);
  }
  return { value, deltaPct, spark: daily };
}

function sumOver(
  index: DayIndex,
  keys: string[],
  pick: (index: DayIndex, key: string) => number,
): number {
  return keys.reduce((s, k) => s + pick(index, k), 0);
}

const pickCommits = (i: DayIndex, k: string) =>
  i.get(k)?.github?.commits ?? 0;
const pickCoding = (i: DayIndex, k: string) =>
  i.get(k)?.wakatime?.codingSeconds ?? 0;

export function computeDashboardData(opts: {
  snapshots: DaySnapshot[];
  user: DashboardUser;
  rangeDays: RangeDays;
  connected: Record<Platform, boolean>;
  isDemo: boolean;
  lastSyncedAt: string | null;
}): DashboardData {
  const { snapshots, user, rangeDays, connected, isDemo, lastSyncedAt } = opts;
  const index = indexByDate(snapshots);

  const rangeKeys = lastNDateKeys(rangeDays);
  const prevRangeKeys = lastNDateKeys(rangeDays * 2).slice(0, rangeDays);

  // ---------- KPIs con serie diaria y delta vs rango anterior ----------
  const kpis = {
    commits: buildKpi(
      rangeKeys.map((k) => pickCommits(index, k)),
      sumOver(index, prevRangeKeys, pickCommits),
    ),
    codingSeconds: buildKpi(
      rangeKeys.map((k) => pickCoding(index, k)),
      sumOver(index, prevRangeKeys, pickCoding),
    ),
    problemsSolved: buildKpi(
      rangeKeys.map((k) => problemsSolvedOn(index, k)),
      sumOver(index, prevRangeKeys, problemsSolvedOn),
    ),
  };

  // ---------- Streaks (sobre todo el histórico disponible) ----------
  const yearKeys = lastNDateKeys(365);
  let current = 0;
  for (let i = yearKeys.length - 1; i >= 0; i--) {
    if (isActiveDay(index, yearKeys[i])) {
      current++;
    } else if (i === yearKeys.length - 1) {
      // hoy aún sin actividad no rompe la racha de ayer
      continue;
    } else {
      break;
    }
  }
  let longest = 0;
  let run = 0;
  for (const key of yearKeys) {
    if (isActiveDay(index, key)) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  // ---------- Coding Consistency Score (CCS — PLANNING.md §9.1) ----------
  const days90 = lastNDateKeys(90);
  const days30 = lastNDateKeys(30);
  const activeDays90 = days90.filter((k) => isActiveDay(index, k)).length;
  const activeDays30 = days30.filter((k) => isActiveDay(index, k)).length;
  const ratio90 = activeDays90 / 90;
  const ratio30 = activeDays30 / 30;
  const streakFactor = Math.min(current, 30) / 30;
  // CCS = 100 × (0.45 × ratio_90 + 0.30 × ratio_30 + 0.25 × streak_factor)
  const ccsRaw = 100 * (0.45 * ratio90 + 0.30 * ratio30 + 0.25 * streakFactor);
  const ccs = Math.round(ccsRaw);
  const hasCcsData =
    index.size > 0 &&
    (Object.values(Object.fromEntries(index)).some(
      (d) =>
        (d.github?.commits ?? 0) > 0 ||
        (d.wakatime?.codingSeconds ?? 0) > 0 ||
        (d.codeforces?.cfSubmissions ?? 0) > 0,
    ));

  // ---------- Heatmap unificado del último año ----------
  // Intensidad combinada: commits + horas + problemas. Niveles por umbrales
  // sobre la distribución de días no-cero (cuartiles aproximados).
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
    level:
      s.score === 0 ? 0 : s.score <= q1 ? 1 : s.score <= q2 ? 2 : s.score <= q3 ? 3 : 4,
  }));

  // ---------- Lenguajes (rango seleccionado) ----------
  const langTotals = new Map<string, number>();
  for (const key of rangeKeys) {
    for (const lang of index.get(key)?.wakatime?.languages ?? []) {
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

  // ---------- Horas por semana (últimas 12 semanas) ----------
  const weekTotals = new Map<string, number>();
  for (const key of lastNDateKeys(12 * 7)) {
    const week = toDateKey(isoWeekStart(fromDateKey(key)));
    weekTotals.set(week, (weekTotals.get(week) ?? 0) + pickCoding(index, key));
  }
  const weeklyHours: WeeklyHoursPoint[] = [...weekTotals.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([weekStart, seconds]) => {
      const d = fromDateKey(weekStart);
      return {
        weekStart,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        hours: Math.round((seconds / 3600) * 10) / 10,
      };
    });

  // ---------- Dificultad LeetCode ----------
  const latestLc = [...yearKeys]
    .reverse()
    .map((k) => index.get(k)?.leetcode)
    .find((s) => s?.problemsSolvedTotal !== undefined);
  const firstInRangeLc = rangeKeys
    .map((k) => index.get(k)?.leetcode)
    .find((s) => s?.problemsSolvedTotal !== undefined);
  const difficulty = {
    easy: latestLc?.solvedEasy ?? 0,
    medium: latestLc?.solvedMedium ?? 0,
    hard: latestLc?.solvedHard ?? 0,
    solvedInRange:
      latestLc?.problemsSolvedTotal !== undefined &&
      firstInRangeLc?.problemsSolvedTotal !== undefined
        ? Math.max(
            0,
            latestLc.problemsSolvedTotal - firstInRangeLc.problemsSolvedTotal,
          )
        : 0,
  };

  // ---------- Rating Codeforces (último año, días con dato) ----------
  const codeforces: RatingPoint[] = [];
  let lastRating: number | undefined;
  for (const key of yearKeys) {
    const r = index.get(key)?.codeforces?.cfRating;
    if (r !== undefined && r !== lastRating) {
      codeforces.push({ date: key, rating: r });
      lastRating = r;
    }
  }
  const latestCf = [...yearKeys]
    .reverse()
    .map((k) => index.get(k)?.codeforces)
    .find((s) => s?.cfRating !== undefined);

  // ---------- Feed de actividad reciente (últimos 7 días) ----------
  const feedKeys = lastNDateKeys(7);
  const feed: ActivityEvent[] = [];
  let recordHours = 0;
  let recordDate = "";

  for (const [i, key] of feedKeys.entries()) {
    const day = index.get(key);
    if (!day) continue;
    const dateLabel = i === feedKeys.length - 1 ? "Hoy" : key.slice(5);

    const commits = day.github?.commits ?? 0;
    const prs = day.github?.prsMerged ?? 0;
    const codingSeconds = day.wakatime?.codingSeconds ?? 0;
    const codingHours = codingSeconds / 3600;
    const topLang = day.wakatime?.topLanguage;

    if (codingHours > recordHours) {
      recordHours = codingHours;
      recordDate = dateLabel;
    }

    if (commits > 0) {
      feed.push({
        date: dateLabel,
        icon: "commit",
        text: `${commits} commit${commits > 1 ? "s" : ""}${topLang ? ` (${topLang})` : ""}`,
      });
    }
    if (prs > 0) {
      feed.push({
        date: dateLabel,
        icon: "pr",
        text: `${prs} PR${prs > 1 ? "s" : ""} mergeado${prs > 1 ? "s" : ""}`,
      });
    }
    if (codingHours >= 0.5) {
      feed.push({
        date: dateLabel,
        icon: "code",
        text: `${Math.round(codingHours * 10) / 10}h programando${topLang ? ` · ${topLang}` : ""}`,
      });
    }
    const solved = problemsSolvedOn(index, key);
    if (solved > 0) {
      feed.push({
        date: dateLabel,
        icon: "solve",
        text: `${solved} problema${solved > 1 ? "s" : ""} resuelto${solved > 1 ? "s" : ""}`,
      });
    }
    const rating = day.codeforces?.cfRating;
    if (rating && i > 0) {
      const prevDay = index.get(feedKeys[i - 1]);
      const prevRating = prevDay?.codeforces?.cfRating;
      if (prevRating && rating !== prevRating) {
        const delta = rating - prevRating;
        feed.push({
          date: dateLabel,
          icon: "contest",
          text: `Rating CF: ${rating} (${delta > 0 ? "+" : ""}${delta})`,
        });
      }
    }
  }

  if (recordHours >= 3) {
    feed.push({
      date: "",
      icon: "record",
      text: `Récord del mes: ${Math.round(recordHours * 10) / 10}h (${recordDate})`,
    });
  }

  feed.sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));

  return {
    user,
    rangeDays,
    isDemo,
    connected,
    kpis,
    streak: { current, longest },
    ccs: hasCcsData
      ? { score: ccs, ratio90, ratio30, streakFactor, activeDays90 }
      : null,
    heatmap,
    languages,
    weeklyHours,
    difficulty,
    rating: {
      codeforces,
      currentRank: latestCf?.cfRank,
      current: latestCf?.cfRating,
      max: latestCf?.cfMaxRating,
    },
    lastSyncedAt,
    feed,
  };
}
