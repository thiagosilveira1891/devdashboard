import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { isDemoMode } from "@/lib/demo";
import { getCurrentUser } from "@/lib/user";
import { getAnalyticsData } from "./data";
import { ComparisonTable } from "./comparison-table";
import { WeekdayChart } from "./weekday-chart";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { range } = await searchParams;
  const rangeDays = [7, 30].includes(Number(range)) ? Number(range) : 30;
  const data = await getAnalyticsData(rangeDays);
  const demo = isDemoMode();
  const rangeLabel =
    rangeDays === 7 ? "7 días" : "30 días";

  return (
    <div className="space-y-5 max-w-3xl">
      <FadeIn>
        <h1 className="text-[22px] font-semibold tracking-tight">Analytics</h1>
        <p className="text-[12px] text-muted-foreground mt-1">
          Comparativas y patrones de actividad · {rangeLabel}
        </p>
        {demo && (
          <div className="mt-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-2 text-[11px] text-primary font-medium inline-block">
            Modo demo
          </div>
        )}
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card className="p-5 gap-0">
          <h3 className="text-[13px] font-medium mb-4">
            Este período vs anterior
          </h3>
          <ComparisonTable
            current={data.comparison.current}
            previous={data.comparison.previous}
          />
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card className="p-5 gap-0">
          <h3 className="text-[13px] font-medium mb-4">
            Actividad por día de la semana
          </h3>
          <WeekdayChart data={data.weekdayActivity} />
        </Card>
      </FadeIn>

      {data.insights.length > 0 && (
        <FadeIn delay={0.15}>
          <Card className="p-5 gap-0">
            <h3 className="text-[13px] font-medium mb-3">Insights</h3>
            <div className="space-y-2">
              {data.insights.map((insight, i) => (
                <p
                  key={i}
                  className="text-[12px] text-muted-foreground leading-relaxed"
                >
                  {insight}
                </p>
              ))}
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
