// Utilidades de fecha. Trabajamos siempre con claves YYYY-MM-DD (día local).

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Lunes ISO de la semana de la fecha dada. */
export function isoWeekStart(d: Date): Date {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // lunes = 0
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Lista de claves de fecha desde hace `days - 1` días hasta hoy, ascendente. */
export function lastNDateKeys(days: number): string[] {
  const keys: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    keys.push(toDateKey(addDays(today, -i)));
  }
  return keys;
}
