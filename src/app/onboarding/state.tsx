"use client";

import Link from "next/link";
import {
  CodeforcesIcon,
  GithubIcon,
  LeetcodeIcon,
  WakatimeIcon,
} from "@/components/icons";
import { FadeIn } from "@/components/motion/fade-in";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OnboardingState({
  wt,
  lc,
  cf,
  wtConnecting,
  connectLeetcodeForm,
  connectCodeforcesForm,
}: {
  wt: boolean;
  lc: boolean;
  cf: boolean;
  wtConnecting: boolean;
  connectLeetcodeForm: React.ReactNode;
  connectCodeforcesForm: React.ReactNode;
}) {
  return (
    <div className="w-full space-y-3">
      {/* GitHub */}
      <FadeIn delay={0.05}>
        <Card className="p-4 flex items-center gap-3">
          <div className="size-9 rounded-md bg-[#24292e]/20 flex items-center justify-center shrink-0">
            <GithubIcon className="size-5 text-[#fafafa]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">GitHub</p>
            <p className="text-[11px] text-muted-foreground">Commits, PRs, repos</p>
          </div>
          <div className="ml-auto shrink-0 text-[11px] text-green-400 font-medium flex items-center gap-1">
            Conectado
          </div>
        </Card>
      </FadeIn>

      {/* WakaTime */}
      <FadeIn delay={0.1}>
        <Card className="p-4 flex items-center gap-3">
          <div className="size-9 rounded-md bg-[#2c1a4b]/30 flex items-center justify-center shrink-0">
            <WakatimeIcon className="size-5 text-[#8b5cf6]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">WakaTime</p>
            <p className="text-[11px] text-muted-foreground">
              Horas programadas, lenguajes
            </p>
          </div>
          {wt ? (
            <div className="ml-auto shrink-0 text-[11px] text-green-400 font-medium flex items-center gap-1">
              Conectado
            </div>
          ) : wtConnecting ? (
            <div className="ml-auto shrink-0 text-[11px] text-muted-foreground">
              Conectando…
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="ml-auto shrink-0 text-[11px] gap-1.5"
              asChild
            >
              <Link href="/api/auth/wakatime/authorize">Conectar</Link>
            </Button>
          )}
        </Card>
      </FadeIn>

      {/* LeetCode */}
      <FadeIn delay={0.15}>
        <Card className="p-4 flex items-center gap-3">
          <div className="size-9 rounded-md bg-[#ffa116]/15 flex items-center justify-center shrink-0">
            <LeetcodeIcon className="size-5 text-[#ffa116]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">LeetCode</p>
            <p className="text-[11px] text-muted-foreground">
              Problemas, contests
            </p>
          </div>
          {lc ? (
            <div className="ml-auto shrink-0 text-[11px] text-green-400 font-medium flex items-center gap-1">
              Conectado
            </div>
          ) : (
            <div className="ml-auto shrink-0">{connectLeetcodeForm}</div>
          )}
        </Card>
      </FadeIn>

      {/* Codeforces */}
      <FadeIn delay={0.2}>
        <Card className="p-4 flex items-center gap-3">
          <div className="size-9 rounded-md bg-[#1f8acb]/15 flex items-center justify-center shrink-0">
            <CodeforcesIcon className="size-5 text-[#1f8acb]" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">Codeforces</p>
            <p className="text-[11px] text-muted-foreground">Rating, contests</p>
          </div>
          {cf ? (
            <div className="ml-auto shrink-0 text-[11px] text-green-400 font-medium flex items-center gap-1">
              Conectado
            </div>
          ) : (
            <div className="ml-auto shrink-0">{connectCodeforcesForm}</div>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
