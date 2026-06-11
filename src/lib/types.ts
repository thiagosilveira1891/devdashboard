// Tipos de dominio compartidos por la UI, el modo demo y la capa de datos.
// La UI nunca importa tipos de Prisma: la capa de datos mapea DB -> dominio.

export type Platform = "github" | "wakatime" | "leetcode" | "codeforces";

export const PLATFORMS: Platform[] = [
  "github",
  "wakatime",
  "leetcode",
  "codeforces",
];

/** Una fila por plataforma y día. Espejo de la tabla daily_snapshots. */
export interface DaySnapshot {
  /** YYYY-MM-DD (zona horaria del usuario) */
  date: string;
  platform: Platform;

  // GitHub — actividad del día
  commits?: number;
  pullRequests?: number;
  prsMerged?: number;
  issuesOpened?: number;
  reviews?: number;
  // GitHub — gauges (valor acumulado en ese día)
  starsReceived?: number;
  totalRepos?: number;

  // WakaTime
  codingSeconds?: number;
  topLanguage?: string;
  languages?: LanguageSeconds[];

  // LeetCode — gauges
  problemsSolvedTotal?: number;
  solvedEasy?: number;
  solvedMedium?: number;
  solvedHard?: number;
  contestRating?: number;

  // Codeforces
  cfRating?: number;
  cfMaxRating?: number;
  cfRank?: string;
  cfProblemsSolvedTotal?: number;
  cfSubmissions?: number;
}

export interface LanguageSeconds {
  name: string;
  seconds: number;
}

// ---------- Datos agregados que consume el dashboard ----------

export interface KpiSeries {
  /** Valor total del rango seleccionado */
  value: number;
  /** Variación % frente al rango anterior (null si no hay base de comparación) */
  deltaPct: number | null;
  /** Serie diaria del rango, para el sparkline */
  spark: number[];
}

export interface HeatmapCell {
  date: string;
  /** 0 = sin actividad … 4 = máxima intensidad */
  level: 0 | 1 | 2 | 3 | 4;
  commits: number;
  codingSeconds: number;
  problems: number;
}

export interface LanguageShare {
  name: string;
  seconds: number;
  pct: number;
}

export interface WeeklyHoursPoint {
  /** Lunes ISO de la semana, YYYY-MM-DD */
  weekStart: string;
  label: string;
  hours: number;
}

export interface RatingPoint {
  date: string;
  rating: number;
}

export interface ActivityEvent {
  date: string;
  icon: "commit" | "code" | "solve" | "pr" | "contest" | "record";
  text: string;
}

export interface DashboardUser {
  name: string;
  username: string;
  image?: string;
  profileSlug?: string;
}

export interface DashboardData {
  user: DashboardUser;
  rangeDays: number;
  isDemo: boolean;
  connected: Record<Platform, boolean>;
  kpis: {
    commits: KpiSeries;
    codingSeconds: KpiSeries;
    problemsSolved: KpiSeries;
  };
  streak: {
    current: number;
    longest: number;
  };
  ccs: {
    score: number;
    ratio90: number;
    ratio30: number;
    streakFactor: number;
    activeDays90: number;
  } | null;
  /** Último año completo, independiente del rango seleccionado */
  heatmap: HeatmapCell[];
  languages: LanguageShare[];
  weeklyHours: WeeklyHoursPoint[];
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    /** resueltos dentro del rango seleccionado */
    solvedInRange: number;
  };
  rating: {
    codeforces: RatingPoint[];
    currentRank?: string;
    current?: number;
    max?: number;
  };
  lastSyncedAt: string | null;
  feed: ActivityEvent[];
}

export const RANGE_OPTIONS = [7, 30, 90, 365] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

export function parseRange(value: string | undefined): RangeDays {
  const n = Number(value);
  return (RANGE_OPTIONS as readonly number[]).includes(n)
    ? (n as RangeDays)
    : 30;
}
