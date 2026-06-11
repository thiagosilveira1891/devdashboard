import type { DaySnapshot, Platform } from "@/lib/types";

/**
 * Contrato que implementa cada integración de plataforma.
 *
 * Esta interfaz es la unidad de contribución del proyecto: añadir una
 * plataforma nueva (AtCoder, HackerRank, GitLab…) es implementar esto en un
 * archivo nuevo. Ver docs/adapters.md.
 *
 * Reglas para adapters:
 *  - Producen DaySnapshot[]; NUNCA escriben en la base de datos (eso es del
 *    orquestador de sync).
 *  - Declaran sus límites de rate en `rateLimit`; el orquestador los respeta.
 *  - Parsean defensivamente: una API externa rota debe producir un error
 *    legible, no un crash.
 */
export interface PlatformAdapter<Ctx> {
  platform: Platform;

  /** Límites declarativos que el orquestador respeta. */
  rateLimit: {
    /** Cuentas de esta plataforma sincronizables en paralelo. */
    maxConcurrent: number;
    /** Pausa mínima entre requests a la API (presupuesto global). */
    minDelayMs: number;
  };

  /** Cuánta historia puede reconstruir en el primer sync. */
  backfillCapability: {
    maxDays: number;
  };

  /** Trae los datos y los devuelve como snapshots diarios. */
  sync(ctx: Ctx): Promise<SyncResult>;
}

export interface SyncResult {
  snapshots: DaySnapshot[];
  /** Datos de perfil para refrescar la cuenta (login, avatar…). */
  profile?: {
    login?: string;
    avatarUrl?: string;
  };
}

/** Error con mensaje apto para mostrar al usuario en Settings. */
export class AdapterError extends Error {
  constructor(
    message: string,
    /** true = no tiene sentido reintentar (p. ej. token revocado) */
    public readonly permanent: boolean = false,
  ) {
    super(message);
    this.name = "AdapterError";
  }
}
