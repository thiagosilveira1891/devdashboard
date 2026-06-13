import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections";
import { CodeBlock } from "@/components/landing/code-block";
import { REPO_URL } from "@/components/landing/data";
import { getLocale } from "@/components/landing/i18n";
import { btnSecondary, eyebrow } from "@/components/landing/styles";

export const metadata: Metadata = {
  title: "Self-hosting — DevDash",
  description:
    "Run DevDash on your own infrastructure. AGPL-3.0, your data in your own Postgres.",
};

/** Variables de entorno reales del proyecto (ver .env.example). */
const ENV_VARS = [
  { name: "DEMO_MODE", key: "demoMode", required: false },
  { name: "DATABASE_URL", key: "databaseUrl", required: true },
  { name: "AUTH_SECRET", key: "authSecret", required: true },
  { name: "AUTH_GITHUB_ID · AUTH_GITHUB_SECRET", key: "github", required: true },
  { name: "TOKEN_ENCRYPTION_KEY", key: "encryptionKey", required: true },
  { name: "WAKATIME_CLIENT_ID · WAKATIME_CLIENT_SECRET", key: "wakatime", required: false },
  { name: "CRON_SECRET", key: "cronSecret", required: false },
] as const;

type EnvKey = (typeof ENV_VARS)[number]["key"];

const DICT = {
  en: {
    back: "Back to home",
    eyebrow: "SELF-HOSTING",
    title: "Run DevDash on your own infrastructure",
    intro:
      "DevDash is AGPL-3.0 licensed and fully self-hostable. Your metrics live in your own Postgres — the complete product, no paywalled tiers.",
    reqTitle: "Requirements",
    reqs: [
      "Node.js 20+ (or Docker)",
      "A PostgreSQL database (Neon, Supabase or your own)",
      "A GitHub OAuth app for login",
    ],
    quickTitle: "Quickstart",
    quickBody:
      "The fastest path. Boots the app with a bundled Postgres on port 3000.",
    sourceTitle: "From source",
    sourceBody: "Prefer to run it directly with Node:",
    steps: [
      { h: "Clone and install", code: `git clone ${REPO_URL}.git\ncd devdashboard\nnpm install` },
      { h: "Configure environment", code: "cp .env.example .env\n# fill in the values from the table below" },
      { h: "Run database migrations", code: "npx prisma migrate deploy" },
      { h: "Build and start", code: "npm run build\nnpm start" },
    ],
    envTitle: "Environment variables",
    envBody:
      "Set these in your .env (or your host's env settings). Without DATABASE_URL the app runs in demo mode with seed data — no keys needed.",
    required: "required",
    optional: "optional",
    env: {
      demoMode: "Set to false to run the real product. Defaults to demo mode with seed data.",
      databaseUrl: "PostgreSQL connection string, e.g. postgresql://user:pass@host/db?sslmode=require",
      authSecret: "Secret for sessions and JWT. Generate one with: npx auth secret",
      github: "GitHub OAuth app credentials (login + GitHub API). Callback: /api/auth/callback/github",
      encryptionKey: "32-byte hex key (AES-256-GCM) to encrypt stored OAuth tokens. Generate: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      wakatime: "WakaTime OAuth app. Callback: /api/auth/wakatime/callback. Optional — needed only for coding-hours data.",
      cronSecret: "Protects the /api/cron/sync endpoint. Send it as a Bearer token from your scheduler.",
    } as Record<EnvKey, string>,
    cronTitle: "Sync schedule",
    cronBody:
      "DevDash refreshes your platforms by hitting /api/cron/sync. On Vercel this is wired in vercel.json; self-hosted, point any scheduler at the endpoint with your CRON_SECRET as a Bearer token.",
    updateTitle: "Updating",
    updateBody: "Pull the latest, reinstall, migrate and restart:",
    updateCode: "git pull\nnpm install\nnpx prisma migrate deploy\nnpm run build && npm start",
    helpPre: "Stuck or found a bug?",
    helpLink: "Open an issue on GitHub",
  },
  es: {
    back: "Volver al inicio",
    eyebrow: "AUTOHOSPEDAJE",
    title: "Corré DevDash en tu propia infraestructura",
    intro:
      "DevDash tiene licencia AGPL-3.0 y es 100% autohospedable. Tus métricas viven en tu propio Postgres — el producto completo, sin niveles de pago.",
    reqTitle: "Requisitos",
    reqs: [
      "Node.js 20+ (o Docker)",
      "Una base de datos PostgreSQL (Neon, Supabase o la tuya)",
      "Una OAuth App de GitHub para el login",
    ],
    quickTitle: "Inicio rápido",
    quickBody:
      "El camino más rápido. Levanta la app con un Postgres incluido en el puerto 3000.",
    sourceTitle: "Desde el código",
    sourceBody: "Si preferís correrlo directo con Node:",
    steps: [
      { h: "Clonar e instalar", code: `git clone ${REPO_URL}.git\ncd devdashboard\nnpm install` },
      { h: "Configurar el entorno", code: "cp .env.example .env\n# completá los valores de la tabla de abajo" },
      { h: "Correr las migraciones", code: "npx prisma migrate deploy" },
      { h: "Buildear y arrancar", code: "npm run build\nnpm start" },
    ],
    envTitle: "Variables de entorno",
    envBody:
      "Definilas en tu .env (o en la config de tu host). Sin DATABASE_URL la app arranca en modo demo con datos seed — sin keys.",
    required: "obligatoria",
    optional: "opcional",
    env: {
      demoMode: "Poné false para correr el producto real. Por defecto arranca en modo demo con datos seed.",
      databaseUrl: "String de conexión a PostgreSQL, ej. postgresql://user:pass@host/db?sslmode=require",
      authSecret: "Secreto para sesiones y JWT. Generá uno con: npx auth secret",
      github: "Credenciales de la OAuth App de GitHub (login + API). Callback: /api/auth/callback/github",
      encryptionKey: "Clave hex de 32 bytes (AES-256-GCM) para cifrar los tokens OAuth guardados. Generá: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      wakatime: "OAuth App de WakaTime. Callback: /api/auth/wakatime/callback. Opcional — solo para los datos de horas de código.",
      cronSecret: "Protege el endpoint /api/cron/sync. Mandalo como Bearer token desde tu scheduler.",
    } as Record<EnvKey, string>,
    cronTitle: "Sincronización",
    cronBody:
      "DevDash actualiza tus plataformas llamando a /api/cron/sync. En Vercel se configura en vercel.json; autohospedado, apuntá cualquier scheduler al endpoint con tu CRON_SECRET como Bearer token.",
    updateTitle: "Actualizar",
    updateBody: "Traé lo último, reinstalá, migrá y reiniciá:",
    updateCode: "git pull\nnpm install\nnpx prisma migrate deploy\nnpm run build && npm start",
    helpPre: "¿Trabado o encontraste un bug?",
    helpLink: "Abrí un issue en GitHub",
  },
};

/** Bloque de comandos en mono, con scroll horizontal propio. */
function Snippet({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-[#27272A] bg-[#0C0C0E] p-4 font-mono text-[12px] leading-[1.7] text-[#E4E4E7]">
      {code}
    </pre>
  );
}

export default async function SelfHostingPage() {
  const locale = await getLocale();
  const t = DICT[locale];

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] selection:bg-[#6366F1]/40">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
        >
          <ArrowLeft className="size-3.5" />
          {t.back}
        </Link>

        <p className={`${eyebrow} mt-10`}>{t.eyebrow}</p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.1] tracking-tight text-[#FAFAFA] md:text-[40px]">
          {t.title}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[#A1A1AA]">
          {t.intro}
        </p>

        {/* Requisitos */}
        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.reqTitle}
          </h2>
          <ul className="mt-4 space-y-2">
            {t.reqs.map((r) => (
              <li key={r} className="flex gap-2.5 text-[14px] text-[#A1A1AA]">
                <span className="font-mono text-[#22C55E]" aria-hidden>
                  +
                </span>
                {r}
              </li>
            ))}
          </ul>
        </section>

        {/* Quickstart */}
        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.quickTitle}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#A1A1AA]">
            {t.quickBody}
          </p>
          <div className="mt-4">
            <CodeBlock />
          </div>
        </section>

        {/* From source */}
        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.sourceTitle}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#A1A1AA]">
            {t.sourceBody}
          </p>
          <ol className="mt-6 space-y-6">
            {t.steps.map((step, i) => (
              <li key={step.h} className="grid grid-cols-[28px_1fr] gap-3">
                <span className="mt-0.5 grid size-7 place-items-center rounded-full border border-[#27272A] bg-[#111113] font-mono text-[12px] text-[#6366F1]">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-[#FAFAFA]">
                    {step.h}
                  </p>
                  <div className="mt-2">
                    <Snippet code={step.code} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Env vars */}
        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.envTitle}
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#A1A1AA]">
            {t.envBody}
          </p>
          <ul className="mt-5 divide-y divide-[#1C1C1F] overflow-hidden rounded-lg border border-[#27272A] bg-[#111113]">
            {ENV_VARS.map((v) => (
              <li
                key={v.key}
                className="grid gap-1.5 px-4 py-3.5 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <code className="truncate font-mono text-[12px] text-[#6366F1]">
                    {v.name}
                  </code>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide ${
                      v.required
                        ? "bg-[#6366F1]/10 text-[#A5B4FC]"
                        : "bg-[#1C1C1F] text-[#52525B]"
                    }`}
                  >
                    {v.required ? t.required : t.optional}
                  </span>
                </div>
                <span className="min-w-0 break-words text-[13px] leading-relaxed text-[#A1A1AA]">
                  {t.env[v.key]}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Cron */}
        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.cronTitle}
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#A1A1AA]">
            {t.cronBody}
          </p>
        </section>

        {/* Updating */}
        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.updateTitle}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-[#A1A1AA]">
            {t.updateBody}
          </p>
          <div className="mt-4">
            <Snippet code={t.updateCode} />
          </div>
        </section>

        {/* Help */}
        <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-[#27272A] pt-8 text-[14px] text-[#A1A1AA]">
          <span>{t.helpPre}</span>
          <a
            href={`${REPO_URL}/issues`}
            target="_blank"
            rel="noreferrer"
            className={`${btnSecondary} h-9`}
          >
            {t.helpLink}
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
