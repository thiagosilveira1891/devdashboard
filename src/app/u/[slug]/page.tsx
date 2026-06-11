import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { Heatmap } from "@/components/dashboard/heatmap";
import { LanguagesChart } from "@/components/charts/languages-chart";
import { RatingChart } from "@/components/charts/rating-chart";
import { formatHours, formatNumber } from "@/lib/format";
import { getProfileData } from "./profile-data";
import { ShareProfileButton } from "./share-profile-button";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProfileData(slug);
  if (!data) return { title: "Perfil no encontrado" };

  const origin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const ogImage = `${origin}/api/og/profile/${encodeURIComponent(slug)}`;

  return {
    title: `${data.name} — Developer Dashboard`,
    description: `${formatNumber(data.stats.commitsYear)} commits · ${formatHours(data.stats.hoursYear)} programadas · ${data.stats.problemsTotal} problemas`,
    openGraph: {
      title: `${data.name} — Developer Dashboard`,
      description: `${formatNumber(data.stats.commitsYear)} commits · ${formatHours(data.stats.hoursYear)} programadas · ${data.stats.problemsTotal} problemas`,
      type: "profile",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.name} — Developer Dashboard`,
      description: `${formatNumber(data.stats.commitsYear)} commits · ${formatHours(data.stats.hoursYear)} programadas · ${data.stats.problemsTotal} problemas`,
      images: [ogImage],
    },
  };
}

const PLATFORM_LABELS: Record<string, string> = {
  github: "GitHub",
  wakatime: "WakaTime",
  leetcode: "LeetCode",
  codeforces: "Codeforces",
};

const PLATFORM_COLORS: Record<string, string> = {
  github: "bg-[#24292e]/40 text-[#fafafa]",
  wakatime: "bg-[#2c1a4b]/40 text-[#a78bfa]",
  leetcode: "bg-[#ffa116]/20 text-[#ffa116]",
  codeforces: "bg-[#1f8acb]/20 text-[#1f8acb]",
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="px-3 py-2.5 rounded-md border border-border bg-card/50">
      <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wide">
        {label}
      </p>
      <p className="stat-number text-[22px] font-semibold mt-0.5">{value}</p>
      {sub && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      )}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 gap-0">
      <div className="mb-4">
        <h3 className="text-[13px] font-medium">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </Card>
  );
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const data = await getProfileData(slug);
  if (!data) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[900px] mx-auto px-5 py-12 space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-start gap-4 flex-wrap">
            {data.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.image}
                alt=""
                className="size-14 rounded-full border-2 border-border"
              />
            ) : (
              <div className="size-14 rounded-full bg-primary/15 border-2 border-primary/30 grid place-items-center text-primary text-xl font-semibold">
                {data.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-[22px] font-semibold tracking-tight">
                {data.name}
              </h1>
              <p className="text-[14px] text-muted-foreground font-mono">
                @{data.username}
              </p>
              {data.connected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {data.connected.map((p) => (
                    <span
                      key={p}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PLATFORM_COLORS[p] ?? "bg-border/20 text-muted-foreground"}`}
                    >
                      {PLATFORM_LABELS[p] ?? p}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {data.isDemo && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/40 text-primary bg-primary/10 font-medium">
                demo
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <ShareProfileButton slug={slug} />
            </div>
          </div>
        </FadeIn>

        {/* Stats row */}
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <StatCard
              label="Commits (año)"
              value={formatNumber(data.stats.commitsYear)}
            />
            <StatCard
              label="Horas (año)"
              value={formatHours(data.stats.hoursYear)}
            />
            <StatCard
              label="Problemas"
              value={String(data.stats.problemsTotal)}
            />
            <StatCard
              label="Rating CF"
              value={data.stats.cfRating ? String(data.stats.cfRating) : "—"}
              sub={
                data.stats.cfRank
                  ? `${data.stats.cfRank} · máx ${data.stats.cfMaxRating ?? "—"}`
                  : undefined
              }
            />
            <StatCard
              label="Mejor racha"
              value={`${data.stats.longestStreak}d`}
              sub="días seguidos"
            />
          </div>
        </FadeIn>

        {/* Heatmap */}
        <FadeIn delay={0.1}>
          <SectionCard
            title="Actividad unificada"
            subtitle="Último año · commits + horas + problemas"
          >
            <Heatmap cells={data.heatmap} />
          </SectionCard>
        </FadeIn>

        {/* Graphs row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <FadeIn delay={0.15}>
            <SectionCard title="Lenguajes" subtitle="Horas por lenguaje · último año">
              <LanguagesChart languages={data.languages} />
            </SectionCard>
          </FadeIn>
          <FadeIn delay={0.2}>
            <SectionCard title="Rating competitivo" subtitle="Codeforces · último año">
              <RatingChart points={data.rating.codeforces} />
            </SectionCard>
          </FadeIn>
        </div>

        {/* Footer */}
        <FadeIn delay={0.25}>
          <div className="pt-6 border-t border-border text-center">
            <p className="text-[12px] text-muted-foreground">
              Hecho con{" "}
              <Link
                href="/"
                className="text-primary hover:underline font-medium"
              >
                Developer Dashboard
              </Link>{" "}
              — crea el tuyo
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
