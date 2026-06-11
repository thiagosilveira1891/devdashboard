import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <div className="h-6 w-48 rounded bg-muted animate-pulse" />
          <div className="h-3.5 w-36 rounded bg-muted animate-pulse mt-1.5" />
        </div>
        <div className="h-8 w-[120px] rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-[140px] rounded-md bg-muted animate-pulse" />
      </div>

      {/* KPI skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 gap-0">
            <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
            <div className="h-8 w-16 rounded bg-muted animate-pulse mt-2" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse mt-3" />
          </Card>
        ))}
      </div>

      {/* Heatmap skeleton */}
      <Card className="p-5 gap-0">
        <div className="h-4 w-40 rounded bg-muted animate-pulse mb-1" />
        <div className="h-3 w-64 rounded bg-muted animate-pulse mb-4" />
        <div className="grid grid-cols-13 gap-[2px]">
          {Array.from({ length: 91 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-sm bg-muted animate-pulse"
              style={{ animationDelay: `${(i % 13) * 60}ms`, opacity: 0.15 + (i % 4) * 0.08 }}
            />
          ))}
        </div>
      </Card>

      {/* Charts skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 gap-0">
            <div className="h-4 w-28 rounded bg-muted animate-pulse mb-1" />
            <div className="h-3 w-44 rounded bg-muted animate-pulse mb-4" />
            <div className="h-40 rounded-md bg-muted animate-pulse" />
          </Card>
        ))}
      </div>

      {/* Feed skeleton */}
      <Card className="p-5 gap-0">
        <div className="h-4 w-32 rounded bg-muted animate-pulse mb-1" />
        <div className="h-3 w-48 rounded bg-muted animate-pulse mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 py-2 border-b border-border/50 last:border-0"
          >
            <div className="size-3 rounded bg-muted animate-pulse" />
            <div className="h-3.5 flex-1 rounded bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </Card>
    </div>
  );
}
