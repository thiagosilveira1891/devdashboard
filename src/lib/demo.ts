/**
 * Modo demo: la app funciona sin base de datos ni API keys, con datos seed
 * deterministas. Es el modo por defecto para desarrollo y contributors.
 *
 * Activo cuando DEMO_MODE=true o cuando no hay DATABASE_URL configurada.
 */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "true") return true;
  if (process.env.DEMO_MODE === "false") return false;
  return !process.env.DATABASE_URL;
}
