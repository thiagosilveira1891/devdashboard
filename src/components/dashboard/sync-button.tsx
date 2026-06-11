"use client";

import { RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { refreshSync } from "@/app/actions/sync";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SyncButton({
  isDemo,
  lastSyncedAt,
}: {
  isDemo: boolean;
  lastSyncedAt: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const lastSyncLabel = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  function onClick() {
    if (isDemo) {
      setMessage("Modo demo: datos de ejemplo");
      setTimeout(() => setMessage(null), 2500);
      return;
    }
    startTransition(async () => {
      const result = await refreshSync();
      setMessage(result.message);
      setTimeout(() => setMessage(null), 3500);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {message ? (
        <span className="text-[11px] text-muted-foreground">{message}</span>
      ) : (
        lastSyncLabel && (
          <span className="text-[11px] text-[var(--text-faint)]">
            sync {lastSyncLabel}
          </span>
        )
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        disabled={pending}
        className="h-8 gap-1.5 text-[12px]"
      >
        <RefreshCw className={cn("size-3.5", pending && "animate-spin")} />
        Sync
      </Button>
    </div>
  );
}
