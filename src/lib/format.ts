// Formateo de números para la UI (es-ES).

const nf = new Intl.NumberFormat("es-ES");

export function formatNumber(n: number): string {
  return nf.format(n);
}

/** 314100 segundos -> "87,3 h" · 5400 -> "1,5 h" · 1500 -> "25 min" */
export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)} min`;
  const rounded = Math.round(hours * 10) / 10;
  return `${nf.format(rounded)} h`;
}

export function formatDelta(deltaPct: number | null): string | null {
  if (deltaPct === null) return null;
  const sign = deltaPct > 0 ? "▲" : deltaPct < 0 ? "▼" : "·";
  return `${sign} ${Math.abs(deltaPct)}%`;
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 6) return "Buenas noches";
  if (h < 13) return "Buenos días";
  if (h < 21) return "Buenas tardes";
  return "Buenas noches";
}
