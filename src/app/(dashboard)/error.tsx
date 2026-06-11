"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <FadeIn>
        <p className="text-[13px] font-medium text-muted-foreground mb-1">
          Algo salió mal
        </p>
        <p className="text-[12px] text-muted-foreground/60 mb-6 max-w-sm">
          {error.message || "Error inesperado cargando el dashboard."}
        </p>
        <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
          <RefreshCw className="size-3.5" />
          Reintentar
        </Button>
      </FadeIn>
    </div>
  );
}
