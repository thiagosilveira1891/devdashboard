// i18n de la landing. La copy de marketing se traduce; las "capturas" del
// producto (DashboardPreview, CodeBlock) quedan en inglés a propósito.
// El idioma vive en una cookie y se lee en el servidor → sin parpadeo.

import { cookies } from "next/headers";

import { LOCALE_COOKIE, type Locale } from "@/components/landing/locale";

const en = {
  nav: {
    features: "Features",
    analytics: "Analytics",
    openSource: "Open Source",
    selfHost: "Self Host",
    login: "Log in",
    getStarted: "Get Started",
    star: "Star",
  },
  hero: {
    eyebrow: "OPEN SOURCE · AGPL-3.0",
    title1: "Your entire",
    title2: "developer journey.",
    title3: "One dashboard.",
    subtitle:
      "Track commits, coding hours, problem solving, streaks and growth across every platform you use — with history that never resets.",
    ctaPrimary: "Continue with GitHub",
    ctaDemo: "Get Started",
    ctaSecondary: "View Demo",
    pullsFrom: "PULLS DATA FROM",
  },
  problem: {
    eyebrow: "THE PROBLEM",
    title: "Your developer data is scattered.",
    body: "Four platforms, four tabs, four partial versions of you. None of them shows the whole picture.",
    nodeSub: "single profile · complete history",
  },
  features: {
    eyebrow: "FEATURES",
    title: "Everything in one place.",
    body: "Four platforms in. One developer profile out.",
    items: {
      timeline: {
        label: "TIMELINE",
        title: "Unified activity timeline",
        description:
          "One contribution graph for everything you do as a developer. Commits, coding hours and problems solved, merged into a single heatmap with per-platform filters.",
        specs: [
          "One graph for commits, hours and problems",
          "365-day history that never resets",
          "Filter by platform or see everything at once",
        ],
      },
      analytics: {
        label: "ANALYTICS",
        title: "Developer analytics",
        description:
          "Week-over-week comparisons, productivity patterns and automatic insights about when and how you actually code.",
        specs: [
          "Compare any period against the last one",
          "Productivity breakdown by weekday",
          "Insights generated from your own data",
        ],
      },
      languages: {
        label: "LANGUAGES",
        title: "Language tracking",
        description:
          "Distribution measured from real coding time in your editor — not just the bytes sitting in your repos.",
        specs: [
          "Tracked from actual editor activity",
          "Repos and coding time, combined",
          "Trends per language over any range",
        ],
      },
      competitive: {
        label: "COMPETITIVE",
        title: "Competitive programming",
        description:
          "LeetCode and Codeforces, side by side. Rating evolution, problems by difficulty and contest history in one view.",
        specs: [
          "Rating evolution with rank context",
          "Problems broken down by difficulty",
          "Contest history across both judges",
        ],
      },
    },
  },
  openSource: {
    eyebrow: "OPEN SOURCE",
    title1: "Own your data.",
    title2: "Self-host in minutes.",
    body: "DevDash is AGPL-3.0 licensed. Run it on your own infrastructure with Docker — your metrics live in your Postgres, not ours. The full product, no paywalled tiers.",
    viewGithub: "View on GitHub",
    docs: "Self-hosting docs →",
    facts: {
      license: "license",
      deploy: "one-command deploy",
      db: "your data, your db",
    },
  },
  profiles: {
    eyebrow: "PROFILES",
    title: "Proof, not testimonials.",
    body: "Every DevDash account gets a public profile — live data you can share like a résumé, not quotes on a landing page.",
    stats: { commits: "commits", coded: "coded", problems: "problems" },
    streak: "{n} day streak",
    footerPre: "Profiles are public pages — see a live one at",
  },
  compare: {
    eyebrow: "COMPARE",
    title: "One tool instead of four tabs.",
    body: "Each platform tracks a slice. DevDash tracks the developer.",
    featureHeader: "FEATURE",
    rows: [
      "Commits",
      "Coding hours",
      "Problems solved",
      "Contest rating",
      "Language stats",
      "Streaks",
      "Unified timeline",
      "Self-hosted, open source",
    ],
  },
  cta: {
    title1: "Start tracking your entire",
    title2: "developer journey.",
    body: "Free and open source. Connect your accounts in five minutes.",
    primary: "Get Started",
    secondary: "View GitHub",
  },
  footer: {
    docs: "Documentation",
    selfHost: "Self Host",
    privacy: "Privacy",
  },
};

export type Dict = typeof en;

const es: Dict = {
  nav: {
    features: "Funciones",
    analytics: "Analítica",
    openSource: "Open Source",
    selfHost: "Autohospedaje",
    login: "Iniciar sesión",
    getStarted: "Empezar",
    star: "Star",
  },
  hero: {
    eyebrow: "OPEN SOURCE · AGPL-3.0",
    title1: "Toda tu vida",
    title2: "como developer.",
    title3: "Un solo dashboard.",
    subtitle:
      "Sigue tus commits, horas de código, problemas resueltos, rachas y crecimiento en todas las plataformas que usas — con un historial que nunca se reinicia.",
    ctaPrimary: "Continuar con GitHub",
    ctaDemo: "Empezar",
    ctaSecondary: "Ver demo",
    pullsFrom: "TRAE DATOS DE",
  },
  problem: {
    eyebrow: "EL PROBLEMA",
    title: "Tus datos de developer están dispersos.",
    body: "Cuatro plataformas, cuatro pestañas, cuatro versiones parciales de ti. Ninguna muestra la imagen completa.",
    nodeSub: "un solo perfil · historia completa",
  },
  features: {
    eyebrow: "FUNCIONES",
    title: "Todo en un solo lugar.",
    body: "Cuatro plataformas entran. Un perfil de developer sale.",
    items: {
      timeline: {
        label: "CRONOLOGÍA",
        title: "Cronología de actividad unificada",
        description:
          "Un solo gráfico de contribuciones para todo lo que haces como developer. Commits, horas de código y problemas resueltos, fusionados en un único heatmap con filtros por plataforma.",
        specs: [
          "Un gráfico para commits, horas y problemas",
          "365 días de historia que nunca se reinicia",
          "Filtra por plataforma o velo todo junto",
        ],
      },
      analytics: {
        label: "ANALÍTICA",
        title: "Analítica para developers",
        description:
          "Comparaciones semana a semana, patrones de productividad e insights automáticos sobre cuándo y cómo programas de verdad.",
        specs: [
          "Compara cualquier período con el anterior",
          "Productividad desglosada por día de la semana",
          "Insights generados desde tus propios datos",
        ],
      },
      languages: {
        label: "LENGUAJES",
        title: "Seguimiento de lenguajes",
        description:
          "Distribución medida desde el tiempo real de código en tu editor — no solo los bytes que duermen en tus repos.",
        specs: [
          "Medido desde la actividad real del editor",
          "Repos y tiempo de código, combinados",
          "Tendencias por lenguaje en cualquier rango",
        ],
      },
      competitive: {
        label: "COMPETITIVO",
        title: "Programación competitiva",
        description:
          "LeetCode y Codeforces, lado a lado. Evolución del rating, problemas por dificultad e historial de concursos en una sola vista.",
        specs: [
          "Evolución del rating con contexto de rango",
          "Problemas desglosados por dificultad",
          "Historial de concursos en ambos jueces",
        ],
      },
    },
  },
  openSource: {
    eyebrow: "OPEN SOURCE",
    title1: "Tus datos son tuyos.",
    title2: "Autohospédalo en minutos.",
    body: "DevDash tiene licencia AGPL-3.0. Córrelo en tu propia infraestructura con Docker — tus métricas viven en tu Postgres, no en el nuestro. El producto completo, sin niveles de pago.",
    viewGithub: "Ver en GitHub",
    docs: "Docs de autohospedaje →",
    facts: {
      license: "licencia",
      deploy: "deploy en un comando",
      db: "tus datos, tu db",
    },
  },
  profiles: {
    eyebrow: "PERFILES",
    title: "Pruebas, no testimonios.",
    body: "Cada cuenta de DevDash tiene un perfil público — datos en vivo que puedes compartir como un currículum, no frases en una landing.",
    stats: { commits: "commits", coded: "código", problems: "problemas" },
    streak: "{n} días de racha",
    footerPre: "Los perfiles son páginas públicas — mira uno en vivo en",
  },
  compare: {
    eyebrow: "COMPARA",
    title: "Una herramienta en vez de cuatro pestañas.",
    body: "Cada plataforma rastrea una parte. DevDash rastrea al developer.",
    featureHeader: "FUNCIÓN",
    rows: [
      "Commits",
      "Horas de código",
      "Problemas resueltos",
      "Rating de concursos",
      "Stats de lenguajes",
      "Rachas",
      "Cronología unificada",
      "Autohospedado, open source",
    ],
  },
  cta: {
    title1: "Empieza a seguir toda tu",
    title2: "vida como developer.",
    body: "Gratis y open source. Conecta tus cuentas en cinco minutos.",
    primary: "Empezar",
    secondary: "Ver GitHub",
  },
  footer: {
    docs: "Documentación",
    selfHost: "Autohospedaje",
    privacy: "Privacidad",
  },
};

export const dictionaries: Record<Locale, Dict> = { en, es };

/** Lee el idioma desde la cookie (default: en). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(LOCALE_COOKIE)?.value === "es" ? "es" : "en";
}

/** Diccionario activo según la cookie. */
export async function getDict(): Promise<Dict> {
  return dictionaries[await getLocale()];
}
