// Constantes/tipos de idioma seguros para el cliente (sin next/headers).
// El toggle (Client Component) importa de aquí; i18n.ts (servidor) reusa esto.

export type Locale = "en" | "es";

export const LOCALE_COOKIE = "lang";
export const LOCALES: Locale[] = ["en", "es"];
