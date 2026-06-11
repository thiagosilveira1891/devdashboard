import { addDays, toDateKey } from "@/lib/dates";
import type { DashboardUser, DaySnapshot, LanguageSeconds } from "@/lib/types";

/**
 * Datos seed del modo demo: ~420 días de actividad realista y DETERMINISTA
 * (mismo seed -> mismos datos) para una developer ficticia.
 *
 * Realista significa: ritmo semanal (menos finde), rachas y huecos, una semana
 * de vacaciones, lenguajes con tendencia (Rust creciendo), contests de
 * Codeforces cada ~2 semanas con rating que sube con altibajos.
 */

export const DEMO_USER: DashboardUser = {
  name: "Ada Demo",
  username: "ada",
  image: undefined,
  profileSlug: "ada",
};

const DAYS = 420;
const SEED = 20260611;

/** PRNG mulberry32: rápido, determinista, suficiente para datos seed. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let cache: DaySnapshot[] | null = null;
let cacheDay: string | null = null;

export function getDemoSnapshots(): DaySnapshot[] {
  const today = toDateKey(new Date());
  // Regenerar al cambiar de día (el "hoy" del demo avanza con el reloj)
  if (cache && cacheDay === today) return cache;

  const rand = mulberry32(SEED);
  const snapshots: DaySnapshot[] = [];
  const start = addDays(new Date(), -(DAYS - 1));

  // Gauges acumulativos
  let stars = 38;
  let repos = 14;
  let lcEasy = 61;
  let lcMedium = 88;
  let lcHard = 9;
  let lcContestRating = 1568;
  let cfRating = 1392;
  let cfMaxRating = 1392;
  let cfSolved = 214;

  // La semana de vacaciones empieza hace ~200 días
  const vacationStart = DAYS - 200;

  for (let i = 0; i < DAYS; i++) {
    const date = toDateKey(addDays(start, i));
    const dow = addDays(start, i).getDay(); // 0 = domingo
    const isWeekend = dow === 0 || dow === 6;
    const onVacation = i >= vacationStart && i < vacationStart + 8;
    const progress = i / DAYS; // 0 -> 1, para tendencias

    // ¿Día activo? Ritmo semanal con huecos realistas
    const offChance = onVacation ? 0.85 : isWeekend ? 0.45 : 0.12;
    const active = rand() > offChance;
    const intensity = active ? 0.35 + rand() * 0.65 : 0;

    // ---------- GitHub ----------
    const commits = active ? Math.max(1, Math.round(intensity * 9 * rand() + intensity * 3)) : 0;
    const prsMerged = active && rand() < 0.22 ? 1 + (rand() < 0.2 ? 1 : 0) : 0;
    const reviews = active && rand() < 0.18 ? 1 : 0;
    const issuesOpened = active && rand() < 0.1 ? 1 : 0;
    if (active && rand() < 0.1) stars += Math.round(rand() * 3);
    if (active && rand() < 0.015) repos += 1;

    snapshots.push({
      date,
      platform: "github",
      commits,
      prsMerged,
      pullRequests: prsMerged,
      reviews,
      issuesOpened,
      starsReceived: stars,
      totalRepos: repos,
    });

    // ---------- WakaTime ----------
    const codingSeconds = active
      ? Math.round((1.2 + intensity * 4.8) * 3600 * (0.8 + rand() * 0.4))
      : rand() < 0.15
        ? Math.round(rand() * 1800) // días "off" con algo de lectura de código
        : 0;

    if (codingSeconds > 0) {
      // Rust crece con el tiempo a costa de Python; TypeScript domina estable
      const rustShare = 0.04 + progress * 0.16;
      const shares: [string, number][] = [
        ["TypeScript", 0.44 + rand() * 0.06],
        ["Python", Math.max(0.06, 0.24 - progress * 0.1) + rand() * 0.04],
        ["Rust", rustShare + rand() * 0.04],
        ["Go", 0.08 + rand() * 0.03],
        ["CSS", 0.06 + rand() * 0.03],
        ["SQL", 0.04 + rand() * 0.02],
      ];
      const total = shares.reduce((s, [, v]) => s + v, 0);
      const languages: LanguageSeconds[] = shares.map(([name, v]) => ({
        name,
        seconds: Math.round((v / total) * codingSeconds),
      }));
      snapshots.push({
        date,
        platform: "wakatime",
        codingSeconds,
        topLanguage: languages[0].name,
        languages,
      });
    } else {
      snapshots.push({ date, platform: "wakatime", codingSeconds: 0 });
    }

    // ---------- LeetCode ----------
    // Sesiones de práctica ~3 días por semana cuando está activa
    const practices = active && rand() < 0.45;
    if (practices) {
      const solved = 1 + Math.round(rand() * 2.4);
      for (let s = 0; s < solved; s++) {
        const r = rand();
        if (r < 0.32) lcEasy++;
        else if (r < 0.87) lcMedium++;
        else lcHard++;
      }
    }
    // Contest de LeetCode ~cada 3 semanas
    if (i % 21 === 13 && rand() < 0.8) {
      lcContestRating += Math.round((rand() - 0.38) * 42);
    }
    snapshots.push({
      date,
      platform: "leetcode",
      problemsSolvedTotal: lcEasy + lcMedium + lcHard,
      solvedEasy: lcEasy,
      solvedMedium: lcMedium,
      solvedHard: lcHard,
      contestRating: lcContestRating,
    });

    // ---------- Codeforces ----------
    // Contest cada ~12 días; práctica algunos días activos
    const isContestDay = i % 12 === 7 && !onVacation && rand() < 0.75;
    let cfSubmissions = 0;
    if (isContestDay) {
      const delta = Math.round((rand() - 0.42) * 95);
      cfRating = Math.max(1100, cfRating + delta);
      cfMaxRating = Math.max(cfMaxRating, cfRating);
      cfSubmissions = 4 + Math.round(rand() * 5);
      cfSolved += Math.round(1 + rand() * 3);
    } else if (active && rand() < 0.22) {
      cfSubmissions = 1 + Math.round(rand() * 3);
      cfSolved += Math.round(rand() * 2);
    }
    snapshots.push({
      date,
      platform: "codeforces",
      cfRating,
      cfMaxRating,
      cfRank: cfRankFor(cfRating),
      cfProblemsSolvedTotal: cfSolved,
      cfSubmissions,
    });
  }

  cache = snapshots;
  cacheDay = today;
  return snapshots;
}

export function cfRankFor(rating: number): string {
  if (rating < 1200) return "newbie";
  if (rating < 1400) return "pupil";
  if (rating < 1600) return "specialist";
  if (rating < 1900) return "expert";
  if (rating < 2100) return "candidate master";
  if (rating < 2300) return "master";
  if (rating < 2400) return "international master";
  return "grandmaster";
}
