// Datos demo deterministas para la landing. Todo sale de un PRNG con semilla
// para que SSR y cliente rendericen exactamente el mismo markup.
// La landing fuerza tema oscuro, así que sus colores van hardcodeados aquí
// (no dependen del toggle de tema del dashboard).

export const REPO_URL = "https://github.com/thiagosilveira1891/devdashboard";

export const HEAT_COLORS = [
  "#161618",
  "#312E81",
  "#4338CA",
  "#6366F1",
  "#A5B4FC",
] as const;

export const PLATFORMS = [
  { name: "GitHub", metric: "commits", color: "#FAFAFA" },
  { name: "LeetCode", metric: "problems solved", color: "#F59E0B" },
  { name: "Codeforces", metric: "contest rating", color: "#38BDF8" },
  { name: "WakaTime", metric: "coding hours", color: "#A78BFA" },
] as const;

export type HeatCell = {
  level: 0 | 1 | 2 | 3 | 4;
  commits: number;
  hours: number;
  problems: number;
};

/** PRNG determinista (mulberry32): misma semilla, mismos datos. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Celdas de actividad (más antigua → más reciente), en columnas de 7 días.
 * La energía sube hacia el final y las últimas semanas casi no tienen huecos:
 * la historia que cuenta es la de una racha activa.
 */
export function generateHeatCells(weeks: number, seed = 7): HeatCell[] {
  const rand = mulberry32(seed);
  const cells: HeatCell[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const week = Math.floor(i / 7);
    const day = i % 7;
    const ramp = 0.45 + 0.55 * (week / Math.max(1, weeks - 1));
    const wobble = 0.8 + 0.2 * Math.sin(week * 1.7 + seed);
    const weekday = day < 5 ? 1 : 0.55;
    let v = rand() * ramp * wobble * weekday;
    if (week >= weeks - 7 && rand() > 0.08) v = Math.max(v, 0.16);
    const level = (
      v > 0.6 ? 4 : v > 0.42 ? 3 : v > 0.27 ? 2 : v > 0.13 ? 1 : 0
    ) as HeatCell["level"];
    cells.push({
      level,
      commits: level === 0 ? 0 : Math.round(level * (1 + rand() * 2.5)),
      hours: level === 0 ? 0 : Math.round(level * (0.7 + rand() * 1.4) * 10) / 10,
      problems: level >= 2 && rand() > 0.55 ? Math.ceil(rand() * 3) : 0,
    });
  }
  return cells;
}

/** Serie de rating estilo Codeforces: deriva alcista con caídas reales. */
export function generateRatingSeries(points = 28, seed = 3): number[] {
  const rand = mulberry32(seed);
  const out: number[] = [];
  let r = 1386;
  for (let i = 0; i < points; i++) {
    r += (rand() - 0.38) * 60;
    r = Math.max(1300, Math.min(1650, r));
    out.push(Math.round(r));
  }
  out[points - 1] = 1612;
  return out;
}

export const LANGUAGES = [
  { name: "TypeScript", pct: 38, hours: "54.2h", color: "#6366F1" },
  { name: "Python", pct: 24, hours: "34.1h", color: "#818CF8" },
  { name: "Rust", pct: 17, hours: "24.6h", color: "#A5B4FC" },
  { name: "Go", pct: 12, hours: "17.4h", color: "#C7D2FE" },
  { name: "CSS", pct: 9, hours: "12.3h", color: "#3F3F46" },
] as const;

export const PROFILES = [
  {
    name: "Ada Lovelace",
    handle: "ada",
    initials: "AL",
    seed: 31,
    commits: "89",
    hours: "92h",
    problems: "28",
    streak: 12,
  },
  {
    name: "Grace Hopper",
    handle: "grace",
    initials: "GH",
    seed: 47,
    commits: "214",
    hours: "168h",
    problems: "57",
    streak: 21,
  },
  {
    name: "Alan Turing",
    handle: "turing",
    initials: "AT",
    seed: 59,
    commits: "132",
    hours: "121h",
    problems: "41",
    streak: 9,
  },
] as const;
