import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { FadeIn } from "@/components/motion/fade-in";
import { isDemoMode } from "@/lib/demo";
import { getDb, isDbEnabled } from "@/lib/db";
import { ThemeToggle } from "@/components/theme/toggle";
import { ConnectionsList } from "./connections-list";
import { DataSection } from "./data-section";
import { ProfileSection } from "./profile-section";

export const metadata: Metadata = { title: "Settings" };

interface AccountInfo {
  platform: string;
  connected: boolean;
  login: string | null;
  syncStatus: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
}

export default async function SettingsPage() {
  const demo = isDemoMode();
  const session = await auth();
  if (!demo && !session?.user?.id) redirect("/");

  let accounts: AccountInfo[] = [];
  let profileSlug: string | null = null;
  let isPublic = false;
  let showGithub = true;
  let showWakatime = true;
  let showLeetcode = true;
  let showCodeforces = true;

  if (isDbEnabled() && session?.user?.id) {
    const db = getDb();
    const userId = session.user.id;
    const [gh, wt, lc, cf, pubProfile] = await Promise.all([
      db.githubAccount.findUnique({ where: { userId } }),
      db.wakatimeAccount.findUnique({ where: { userId } }),
      db.leetcodeAccount.findUnique({ where: { userId } }),
      db.codeforcesAccount.findUnique({ where: { userId } }),
      db.publicProfile.findUnique({ where: { userId } }),
    ]);

    if (pubProfile) {
      profileSlug = pubProfile.slug;
      isPublic = pubProfile.isPublic;
      showGithub = pubProfile.showGithub;
      showWakatime = pubProfile.showWakatime;
      showLeetcode = pubProfile.showLeetcode;
      showCodeforces = pubProfile.showCodeforces;
    }

    const fmtDate = (d: Date | null) =>
      d
        ? new Date(d).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

    accounts = [
      {
        platform: "github",
        connected: !!gh,
        login: gh?.login ?? null,
        syncStatus: gh?.syncStatus.toLowerCase() ?? "idle",
        lastSyncedAt: fmtDate(gh?.lastSyncedAt ?? null),
        lastSyncError: gh?.lastSyncError ?? null,
      },
      {
        platform: "wakatime",
        connected: !!wt,
        login: wt?.displayName ?? null,
        syncStatus: wt?.syncStatus.toLowerCase() ?? "idle",
        lastSyncedAt: fmtDate(wt?.lastSyncedAt ?? null),
        lastSyncError: wt?.lastSyncError ?? null,
      },
      {
        platform: "leetcode",
        connected: !!lc,
        login: lc?.username ?? null,
        syncStatus: lc?.syncStatus.toLowerCase() ?? "idle",
        lastSyncedAt: fmtDate(lc?.lastSyncedAt ?? null),
        lastSyncError: lc?.lastSyncError ?? null,
      },
      {
        platform: "codeforces",
        connected: !!cf,
        login: cf?.handle ?? null,
        syncStatus: cf?.syncStatus.toLowerCase() ?? "idle",
        lastSyncedAt: fmtDate(cf?.lastSyncedAt ?? null),
        lastSyncError: cf?.lastSyncError ?? null,
      },
    ];
  } else if (demo) {
    accounts = [
      { platform: "github", connected: true, login: "ada", syncStatus: "idle", lastSyncedAt: "hoy, 14:30", lastSyncError: null },
      { platform: "wakatime", connected: true, login: "Ada Demo", syncStatus: "idle", lastSyncedAt: "hoy, 14:30", lastSyncError: null },
      { platform: "leetcode", connected: true, login: "ada_demo", syncStatus: "idle", lastSyncedAt: "hoy, 14:30", lastSyncError: null },
      { platform: "codeforces", connected: true, login: "ada_demo", syncStatus: "idle", lastSyncedAt: "hoy, 14:30", lastSyncError: null },
    ];
    profileSlug = "ada";
    isPublic = true;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <FadeIn>
        <h1 className="text-[22px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[12px] text-muted-foreground mt-1">
          Gestioná tus cuentas conectadas y preferencias.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section>
          <h2 className="text-[14px] font-medium mb-3">Conexiones</h2>
          <ConnectionsList accounts={accounts} />
        </section>
      </FadeIn>

      <FadeIn delay={0.07}>
        <section>
          <h2 className="text-[14px] font-medium mb-3">Perfil público</h2>
          <ProfileSection
            slug={profileSlug}
            isPublic={isPublic}
            showGithub={showGithub}
            showWakatime={showWakatime}
            showLeetcode={showLeetcode}
            showCodeforces={showCodeforces}
          />
        </section>
      </FadeIn>

      <FadeIn delay={0.08}>
        <section>
          <h2 className="text-[14px] font-medium mb-3">Preferencias</h2>
          <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Tema</p>
              <p className="text-[11px] text-muted-foreground">
                Claro u oscuro, como prefieras.
              </p>
            </div>
            <ThemeToggle />
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <section>
          <h2 className="text-[14px] font-medium mb-3">Datos</h2>
          <DataSection />
        </section>
      </FadeIn>
    </div>
  );
}
