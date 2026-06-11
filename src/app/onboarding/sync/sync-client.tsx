"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SyncState {
  platform: string;
  label: string;
  status: "pending" | "running" | "success" | "error";
  items?: number;
}

const PLATFORMS: { platform: string; label: string }[] = [
  { platform: "github", label: "GitHub" },
  { platform: "wakatime", label: "WakaTime" },
  { platform: "leetcode", label: "LeetCode" },
  { platform: "codeforces", label: "Codeforces" },
];

const MESSAGES: Record<string, string[]> = {
  github: ["Conectando con GitHub…", "Contando tus commits…", "Importando PRs y repos…"],
  wakatime: ["Conectando con WakaTime…", "Calculando tus horas…", "Analizando lenguajes…"],
  leetcode: ["Consultando LeetCode…", "Contando problemas resueltos…", "Revisando contests…"],
  codeforces: ["Consultando Codeforces…", "Preguntando por tu rating…", "Importando submissions…"],
};

export function OnboardingSync() {
  const router = useRouter();
  const [states, setStates] = useState<SyncState[]>(
    PLATFORMS.map((p) => ({ ...p, status: "pending" })),
  );
  const [msgIndex, setMsgIndex] = useState(0);
  const [done, setDone] = useState(false);

  const cycleMessages = useCallback(() => {
    setMsgIndex((i) => (i + 1) % 3);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleMessages, 2200);
    return () => clearInterval(interval);
  }, [cycleMessages]);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/onboarding/status");
        if (!res.ok) return;
        const data = (await res.json()) as SyncState[];
        if (!cancelled) {
          setStates(data);
          if (data.every((s) => s.status === "success" || s.status === "error")) {
            setDone(true);
          }
        }
      } catch {
        // seguir intentando
      }
      attempts++;
      if (attempts < 30 && !done) {
        setTimeout(poll, 2000);
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [done]);

  const hasGithub = states.some(
    (s) => s.platform === "github" && (s.status === "success" || s.status === "running"),
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto w-full">
        <FadeIn>
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            {done ? "¡Todo listo!" : "Sincronizando tus datos"}
          </h1>
          <p className="text-muted-foreground text-[14px] text-center mt-2 mb-10">
            {done
              ? "Tus plataformas están conectadas."
              : "Esto toma unos segundos. Importamos tu historia de cada plataforma."}
          </p>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="w-full space-y-2">
            {states.map((state) => (
              <Card
                key={state.platform}
                className="p-4 flex items-center gap-3"
              >
                <div className="shrink-0">
                  {state.status === "success" ? (
                    <Check className="size-4 text-green-400" />
                  ) : state.status === "error" ? (
                    <X className="size-4 text-red-400" />
                  ) : state.status === "running" ? (
                    <Loader2 className="size-4 text-primary animate-spin" />
                  ) : (
                    <div className="size-4 rounded-full border-2 border-border" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium">{state.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {state.status === "success"
                      ? state.items
                        ? `${state.items} snapshots importados`
                        : "Completado"
                      : state.status === "error"
                        ? "Error — reintentamos luego"
                        : state.status === "running"
                          ? MESSAGES[state.platform]?.[msgIndex] ?? "Sincronizando…"
                          : "Pendiente"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mt-10 w-full">
          {done ? (
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={() => router.push("/dashboard")}
            >
              Ir al dashboard
            </Button>
          ) : hasGithub ? (
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              Saltar al dashboard
            </Button>
          ) : null}
        </FadeIn>
      </div>
    </div>
  );
}
