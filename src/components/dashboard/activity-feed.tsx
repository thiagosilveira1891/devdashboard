import { GitCommit, Code, CheckCircle, GitPullRequest, Trophy, Zap } from "lucide-react";
import type { ActivityEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

const iconMap: Record<ActivityEvent["icon"], React.ReactNode> = {
  commit: <GitCommit className="size-3" />,
  code: <Code className="size-3" />,
  solve: <CheckCircle className="size-3" />,
  pr: <GitPullRequest className="size-3" />,
  contest: <Trophy className="size-3" />,
  record: <Zap className="size-3" />,
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-[12px] text-muted-foreground py-2">
        Sin actividad reciente. Conecta más plataformas para ver tu feed.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div
          key={`${event.date}-${i}`}
          className={cn(
            "flex items-center gap-2.5 py-2 border-b border-border/50 last:border-0",
            event.icon === "record" && "text-[var(--warning)]",
          )}
        >
          <span className="shrink-0 text-muted-foreground">
            {iconMap[event.icon]}
          </span>
          <span
            className={cn(
              "text-[12px] min-w-0 truncate",
              event.icon === "record"
                ? "text-[var(--warning)] font-medium"
                : "text-foreground",
            )}
          >
            {event.text}
          </span>
          {event.date && (
            <span className="ml-auto shrink-0 text-[10px] text-[var(--text-faint)] tabular-nums">
              {event.date}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
