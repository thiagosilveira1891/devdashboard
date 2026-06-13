import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/sections";
import { REPO_URL } from "@/components/landing/data";
import { getLocale } from "@/components/landing/i18n";
import { btnSecondary, eyebrow } from "@/components/landing/styles";

export const metadata: Metadata = {
  title: "Privacy — DevDash",
  description: "What DevDash collects, why, and the control you have over your data.",
};

const DICT = {
  en: {
    back: "Back to home",
    eyebrow: "PRIVACY",
    title: "Privacy Policy",
    updated: "Last updated: June 13, 2026",
    intro:
      "DevDash brings your developer activity into one place. We built it open source because your data should be yours — this is what we collect, why, and the control you keep over it.",
    collect: {
      title: "What we collect",
      items: [
        "Account basics from GitHub OAuth: your username, avatar and email.",
        "The platform handles you connect (LeetCode, Codeforces) and your WakaTime authorization.",
        "Activity metrics synced from those platforms — commits, coding time, problems solved, contest ratings — stored as daily snapshots.",
        "OAuth access tokens, encrypted at rest, used only to sync your data.",
      ],
    },
    use: {
      title: "How we use it",
      items: [
        "Render your private dashboard and analytics.",
        "Build your public profile and share cards — only if you opt in.",
        "Run the daily sync that keeps your metrics current.",
        "We do not sell your data or use it for advertising.",
      ],
    },
    security: {
      title: "Storage & security",
      body: "Your data lives in a PostgreSQL database. OAuth tokens are encrypted with AES-256-GCM before they are stored — never in plain text.",
    },
    profiles: {
      title: "Public profiles",
      body: "Profiles are private by default. You choose to make yours public, and you control visibility per platform. You can switch back to private at any time.",
    },
    thirdParty: {
      title: "Third-party platforms",
      body: "We fetch your data from the official APIs of GitHub, WakaTime, LeetCode and Codeforces using the access you grant. We don't share your data with any other third parties.",
    },
    rights: {
      title: "Your data, your control",
      items: [
        "Export everything as JSON, at any time.",
        "Disconnect a platform and delete its history.",
        "Delete your account — this cascades and removes your data permanently.",
      ],
    },
    cookies: {
      title: "Cookies",
      body: "We use a session cookie to keep you signed in and a small preference cookie to remember your language. No third-party tracking cookies.",
    },
    selfHost: {
      title: "Self-hosting",
      body: "DevDash is open source and self-hostable. If you run your own instance you are the data controller, and this policy covers only the hosted version at devdash.app.",
    },
    changes: {
      title: "Changes & contact",
      body: "We'll update this page when our practices change. Questions or requests?",
    },
    contactLink: "Reach us on GitHub",
  },
  es: {
    back: "Volver al inicio",
    eyebrow: "PRIVACIDAD",
    title: "Política de Privacidad",
    updated: "Última actualización: 13 de junio de 2026",
    intro:
      "DevDash reúne tu actividad de developer en un solo lugar. Lo hicimos open source porque tus datos deberían ser tuyos — esto es lo que recopilamos, por qué, y el control que mantenés sobre ello.",
    collect: {
      title: "Qué recopilamos",
      items: [
        "Datos básicos de la cuenta vía GitHub OAuth: tu usuario, avatar y email.",
        "Los handles de las plataformas que conectás (LeetCode, Codeforces) y tu autorización de WakaTime.",
        "Métricas de actividad sincronizadas de esas plataformas — commits, tiempo de código, problemas resueltos, ratings de concursos — guardadas como snapshots diarios.",
        "Tokens de acceso OAuth, cifrados en reposo, usados solo para sincronizar tus datos.",
      ],
    },
    use: {
      title: "Cómo lo usamos",
      items: [
        "Mostrar tu dashboard privado y tu analítica.",
        "Armar tu perfil público y tus share cards — solo si lo activás.",
        "Correr la sincronización diaria que mantiene tus métricas al día.",
        "No vendemos tus datos ni los usamos para publicidad.",
      ],
    },
    security: {
      title: "Almacenamiento y seguridad",
      body: "Tus datos viven en una base PostgreSQL. Los tokens OAuth se cifran con AES-256-GCM antes de guardarse — nunca en texto plano.",
    },
    profiles: {
      title: "Perfiles públicos",
      body: "Los perfiles son privados por defecto. Vos elegís hacer el tuyo público y controlás la visibilidad por plataforma. Podés volverlo privado cuando quieras.",
    },
    thirdParty: {
      title: "Plataformas de terceros",
      body: "Traemos tus datos desde las APIs oficiales de GitHub, WakaTime, LeetCode y Codeforces usando el acceso que nos das. No compartimos tus datos con ningún otro tercero.",
    },
    rights: {
      title: "Tus datos, tu control",
      items: [
        "Exportá todo en JSON, cuando quieras.",
        "Desconectá una plataforma y borrá su historia.",
        "Borrá tu cuenta — se elimina en cascada y de forma permanente.",
      ],
    },
    cookies: {
      title: "Cookies",
      body: "Usamos una cookie de sesión para mantenerte logueado y una pequeña cookie de preferencia para recordar tu idioma. Sin cookies de tracking de terceros.",
    },
    selfHost: {
      title: "Autohospedaje",
      body: "DevDash es open source y autohospedable. Si corrés tu propia instancia, vos sos el responsable de los datos, y esta política cubre solo la versión hospedada en devdash.app.",
    },
    changes: {
      title: "Cambios y contacto",
      body: "Actualizaremos esta página cuando cambien nuestras prácticas. ¿Dudas o pedidos?",
    },
    contactLink: "Escribinos en GitHub",
  },
};

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
        {title}
      </h2>
      <ul className="mt-4 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex gap-2.5 text-[14px] leading-relaxed text-[#A1A1AA]">
            <span className="mt-px font-mono text-[#22C55E]" aria-hidden>
              +
            </span>
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProseSection({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-12">
      <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#A1A1AA]">
        {body}
      </p>
    </section>
  );
}

export default async function PrivacyPage() {
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
        <p className="mt-3 font-mono text-[12px] text-[#52525B]">{t.updated}</p>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[#A1A1AA]">
          {t.intro}
        </p>

        <ListSection title={t.collect.title} items={t.collect.items} />
        <ListSection title={t.use.title} items={t.use.items} />
        <ProseSection title={t.security.title} body={t.security.body} />
        <ProseSection title={t.profiles.title} body={t.profiles.body} />
        <ProseSection title={t.thirdParty.title} body={t.thirdParty.body} />
        <ListSection title={t.rights.title} items={t.rights.items} />
        <ProseSection title={t.cookies.title} body={t.cookies.body} />
        <ProseSection title={t.selfHost.title} body={t.selfHost.body} />

        <section className="mt-12">
          <h2 className="text-[20px] font-semibold tracking-tight text-[#FAFAFA]">
            {t.changes.title}
          </h2>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-[#A1A1AA]">
            {t.changes.body}
          </p>
          <div className="mt-5">
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noreferrer"
              className={`${btnSecondary} h-9`}
            >
              {t.contactLink}
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
