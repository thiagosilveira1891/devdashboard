"use client";

import { useState, useTransition } from "react";
import {
  CodeforcesIcon,
  GithubIcon,
  LeetcodeIcon,
  WakatimeIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { disconnectPlatform } from "@/app/actions/settings";

interface AccountInfo {
  platform: string;
  connected: boolean;
  login: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
}

const PLATFORM_META: Record<
  string,
  { label: string; description: string; icon: React.ReactNode }
> = {
  github: {
    label: "GitHub",
    description: "Commits, PRs, repos",
    icon: <GithubIcon className="size-5 text-[#fafafa]" />,
  },
  wakatime: {
    label: "WakaTime",
    description: "Horas programadas, lenguajes",
    icon: <WakatimeIcon className="size-5 text-[#8b5cf6]" />,
  },
  leetcode: {
    label: "LeetCode",
    description: "Problemas, contests",
    icon: <LeetcodeIcon className="size-5 text-[#ffa116]" />,
  },
  codeforces: {
    label: "Codeforces",
    description: "Rating, contests",
    icon: <CodeforcesIcon className="size-5 text-[#1f8acb]" />,
  },
};

const STATUS_COLORS: Record<string, string> = {
  idle: "text-green-400",
  syncing: "text-blue-400",
  error: "text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  idle: "OK",
  syncing: "Sync…",
  error: "Error",
};

function ConnectionCard({ account }: { account: AccountInfo }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const meta = PLATFORM_META[account.platform];
  const isGithub = account.platform === "github";

  function handleDisconnect() {
    if (confirming) {
      startTransition(async () => {
        await disconnectPlatform(account.platform);
        setConfirming(false);
      });
    } else {
      setConfirming(true);
    }
  }

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-9 rounded-md flex items-center justify-center shrink-0",
            account.platform === "github" && "bg-[#24292e]/20",
            account.platform === "wakatime" && "bg-[#2c1a4b]/30",
            account.platform === "leetcode" && "bg-[#ffa116]/15",
            account.platform === "codeforces" && "bg-[#1f8acb]/15",
          )}
        >
          {meta.icon}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium">{meta.label}</p>
          <p className="text-[11px] text-muted-foreground">{meta.description}</p>
        </div>
        <div className="ml-auto shrink-0 flex items-center gap-2">
          {account.connected ? (
            <>
              <span
                className={cn(
                  "text-[11px] font-medium",
                  STATUS_COLORS[account.syncStatus] ?? "text-muted-foreground",
                )}
              >
                {STATUS_LABELS[account.syncStatus] ?? account.syncStatus}
              </span>
              {!isGithub && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-[11px] h-7 px-2",
                    confirming && "text-red-400 hover:text-red-400",
                  )}
                  onClick={handleDisconnect}
                  disabled={pending}
                >
                  {pending
                    ? "…"
                    : confirming
                      ? "¿Desconectar?"
                      : "Desconectar"}
                </Button>
              )}
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              No conectado
            </span>
          )}
        </div>
      </div>

      {account.connected && account.lastSyncedAt && (
        <div className="flex items-center gap-3 text-[11px] text-[var(--text-faint)]">
          <span>
            Último sync: {account.lastSyncedAt}
          </span>
          {account.login && <span>@{account.login}</span>}
        </div>
      )}

      {account.connected && account.lastSyncError && (
        <div className="rounded-md border border-red-500/20 bg-red-500/8 px-3 py-1.5 text-[11px] text-red-400">
          {account.lastSyncError}
        </div>
      )}
    </Card>
  );
}

export function ConnectionsList({ accounts }: { accounts: AccountInfo[] }) {
  return (
    <div className="space-y-2">
      {accounts.map((a) => (
        <ConnectionCard key={a.platform} account={a} />
      ))}
    </div>
  );
}
