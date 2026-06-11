import { Flame } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RatingChart } from "@/components/charts/rating-chart";
import { LanguagesChart } from "@/components/charts/languages-chart";
import { WeeklyHoursChart } from "@/components/charts/weekly-hours-chart";
import { DifficultyBars } from "@/components/dashboard/difficulty-bars";
import { Heatmap } from "@/components/dashboard/heatmap";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { RangeSelector } from "@/components/dashboard/range-selector";
import { SyncButton } from "@/components/dashboard/sync-button";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { EmptyChart } from "@/components/dashboard/empty-chart";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatHours, formatNumber, greeting } from "@/lib/format";
import { parseRange } from "@/lib/types";
import { CopyProfileButton } from "@/components/dashboard/copy-profile-button";

export const metadata: Metadata = { title: "Dashboard" };

function ChartCard({
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const rangeDays = parseRange(range);
  const data = await getDashboardData(rangeDays);
  if (!data) redirect("/");

  const firstName = data.user.name.split(" ")[0];
  const rangeLabel = `últimos ${rangeDays === 365 ? "12 meses" : `${rangeDays} días`}`;

  return (
    <div className="space-y-5">
      {data.isDemo && (
        <FadeIn>
          <div className="rounded-lg border border-primary/25 bg-primary/5 px-4 py-2.5 text-[12px] text-muted-foreground">
            <span className="text-primary font-medium">Modo demo</span> — estás
            viendo datos de ejemplo. Configura tu{" "}
            <code className="text-foreground/80">.env</code> para conectar tus
            cuentas reales.
          </div>
        </FadeIn>
      )}

      {/* Header */}
      <FadeIn>
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <h1 className="text-[22px] font-semibold tracking-tight">
              {greeting()}, {firstName}
            </h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Tu actividad de los {rangeLabel}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 h-8">
              <Flame className="size-3.5 text-[var(--warning)]" />
              <span className="stat-number text-[13px] font-semibold">
                {data.streak.current}
              </span>
              <span className="text-[11px] text-muted-foreground">
                días · récord {data.streak.longest}
              </span>
            </div>
            {data.ccs && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 h-8 cursor-default">
                    <span className="text-[10px] text-primary/70 font-medium">
                      CCS
                    </span>
                    <span className="stat-number text-[13px] font-semibold text-primary">
                      {data.ccs.score}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[11px] max-w-[200px]">
                  <p className="font-medium mb-1">
                    Coding Consistency Score
                  </p>
                  <p className="text-muted-foreground">
                    {data.ccs.activeDays90} días activos de 90 (
                    {Math.round(data.ccs.ratio90 * 100)}%)
                  </p>
                  <p className="text-muted-foreground">
                    30 días: {Math.round(data.ccs.ratio30 * 100)}% · racha:{" "}
                    {Math.round(data.ccs.streakFactor * 100)}%
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <RangeSelector current={rangeDays} />
          <SyncButton isDemo={data.isDemo} lastSyncedAt={data.lastSyncedAt} />
          {data.user.profileSlug && (
            <CopyProfileButton slug={data.user.profileSlug} />
          )}
        </div>
      </FadeIn>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FadeIn delay={0.05}>
          <KpiCard
            title="Commits"
            value={formatNumber(data.kpis.commits.value)}
            deltaPct={data.kpis.commits.deltaPct}
            spark={data.kpis.commits.spark}
          />
        </FadeIn>
        <FadeIn delay={0.1}>
          <KpiCard
            title="Horas programadas"
            value={formatHours(data.kpis.codingSeconds.value)}
            deltaPct={data.kpis.codingSeconds.deltaPct}
            spark={data.kpis.codingSeconds.spark}
          />
        </FadeIn>
        <FadeIn delay={0.15}>
          <KpiCard
            title="Problemas resueltos"
            value={formatNumber(data.kpis.problemsSolved.value)}
            deltaPct={data.kpis.problemsSolved.deltaPct}
            spark={data.kpis.problemsSolved.spark}
          />
        </FadeIn>
        <FadeIn delay={0.2}>
          <Card className="p-5 gap-0">
            <p className="text-[12px] text-muted-foreground">Rating Codeforces</p>
            <p className="stat-number text-[28px] font-semibold mt-1.5">
              {data.rating.current ?? "—"}
            </p>
            <p className="text-[12px] mt-3 capitalize text-[var(--chart-4)]">
              {data.rating.currentRank ?? "sin rating"}
              {data.rating.max && (
                <span className="text-[var(--text-faint)]">
                  {" "}
                  · máx {data.rating.max}
                </span>
              )}
            </p>
          </Card>
        </FadeIn>
      </div>

      {/* Heatmap unificado */}
      <FadeIn delay={0.25}>
        <ChartCard
          title="Actividad unificada"
          subtitle="Último año, combinando las 4 plataformas"
        >
          <Heatmap cells={data.heatmap} />
        </ChartCard>
      </FadeIn>

      {/* Grid de gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FadeIn delay={0.3}>
          {data.connected.wakatime ? (
            <ChartCard title="Lenguajes" subtitle={`Horas por lenguaje · ${rangeLabel}`}>
              <LanguagesChart languages={data.languages} />
            </ChartCard>
          ) : (
            <EmptyChart
              title="Lenguajes"
              subtitle="Tus horas por lenguaje de programación"
              cta={{
                label: "Conecta WakaTime para ver tus lenguajes",
                href: "/onboarding",
              }}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.35}>
          {data.connected.wakatime ? (
            <ChartCard
              title="Horas por semana"
              subtitle="Últimas 12 semanas · la línea es tu media"
            >
              <WeeklyHoursChart weeks={data.weeklyHours} />
            </ChartCard>
          ) : (
            <EmptyChart
              title="Horas por semana"
              subtitle="Tu ritmo de programación semanal"
              cta={{
                label: "Conecta WakaTime para ver tus horas",
                href: "/onboarding",
              }}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.4}>
          {data.connected.leetcode ? (
            <ChartCard title="LeetCode" subtitle="Problemas por dificultad">
              <DifficultyBars
                easy={data.difficulty.easy}
                medium={data.difficulty.medium}
                hard={data.difficulty.hard}
                solvedInRange={data.difficulty.solvedInRange}
                rangeDays={rangeDays}
              />
            </ChartCard>
          ) : (
            <EmptyChart
              title="LeetCode"
              subtitle="Problemas por dificultad (Easy/Medium/Hard)"
              cta={{
                label: "Conecta LeetCode para ver tus problemas",
                href: "/onboarding",
              }}
            />
          )}
        </FadeIn>
        <FadeIn delay={0.45}>
          {data.connected.codeforces ? (
            <ChartCard title="Rating competitivo" subtitle="Codeforces · último año">
              <RatingChart points={data.rating.codeforces} />
            </ChartCard>
          ) : (
            <EmptyChart
              title="Rating competitivo"
              subtitle="Evolución de tu rating en Codeforces"
              cta={{
                label: "Conecta Codeforces para ver tu rating",
                href: "/onboarding",
              }}
            />
          )}
        </FadeIn>
      </div>

      <FadeIn delay={0.5}>
        <ChartCard
          title="Actividad reciente"
          subtitle="Últimos 7 días"
        >
          <ActivityFeed events={data.feed} />
        </ChartCard>
      </FadeIn>
    </div>
  );
}
