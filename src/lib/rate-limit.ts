/**
 * Rate limiter en memoria para API routes.
 * MVP: usa un Map en memoria. Escalar a Vercel KV o Redis cuando el tráfico lo pida.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

/**
 * Devuelve true si la request está dentro del límite, false si excedió.
 * @param key identificador único (ej. IP, userId)
 * @param maxRequests máximo de requests permitidos
 * @param windowMs ventana de tiempo en milisegundos
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): boolean {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
}
