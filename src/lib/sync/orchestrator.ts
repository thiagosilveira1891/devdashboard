import { githubAdapter } from "@/lib/adapters/github";
import { codeforcesAdapter } from "@/lib/adapters/codeforces";
import { leetcodeAdapter } from "@/lib/adapters/leetcode";
import { wakatimeAdapter } from "@/lib/adapters/wakatime";
import { AdapterError } from "@/lib/adapters/types";
import { encryptToken, decryptToken } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import type { DaySnapshot, Platform } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Orquestador de sync — pide datos a los adapters y los persiste.
 *
 * Cada plataforma tiene un adapter que produce DaySnapshot[];
 * el orquestador es el único módulo que escribe en la base de datos.
 */

export type SyncTrigger = "cron" | "manual" | "onboarding";

function snapshotDate(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

const PLATFORM_ENUM: Record<Platform, string> = {
  github: "GITHUB",
  wakatime: "WAKATIME",
  leetcode: "LEETCODE",
  codeforces: "CODEFORCES",
};

// ──── Helpers de escritura (compartidos por todas las plataformas) ────

async function writeSnapshots(
  userId: string,
  platform: Platform,
  snapshots: DaySnapshot[],
) {
  const db = getDb();
  const BATCH = 50;
  for (let i = 0; i < snapshots.length; i += BATCH) {
    const batch = snapshots.slice(i, i + BATCH);
    await db.$transaction(
      batch.map((snap) =>
        db.dailySnapshot.upsert({
          where: {
            userId_platform_date: {
              userId,
              platform: PLATFORM_ENUM[platform] as "GITHUB" | "WAKATIME" | "LEETCODE" | "CODEFORCES",
              date: snapshotDate(snap.date),
            },
          },
          create: snapshotCreate(userId, platform, snap),
          update: snapshotUpdate(platform, snap),
        }),
      ),
    );
  }
}

function snapshotCreate(
  userId: string,
  platform: Platform,
  snap: DaySnapshot,
) {
  const base = {
    userId,
    platform: PLATFORM_ENUM[platform] as "GITHUB" | "WAKATIME" | "LEETCODE" | "CODEFORCES",
    date: snapshotDate(snap.date),
  };
  switch (platform) {
    case "github":
      return {
        ...base,
        commits: snap.commits ?? 0,
        pullRequests: snap.pullRequests ?? 0,
        prsMerged: snap.prsMerged ?? 0,
        issuesOpened: snap.issuesOpened ?? 0,
        reviews: snap.reviews ?? 0,
        starsReceived: snap.starsReceived,
        totalRepos: snap.totalRepos,
      };
    case "wakatime":
      return {
        ...base,
        codingSeconds: snap.codingSeconds ?? 0,
        topLanguage: snap.topLanguage,
        languages: (snap.languages as unknown as Prisma.InputJsonValue) ?? undefined,
      };
    case "leetcode":
      return {
        ...base,
        problemsSolvedTotal: snap.problemsSolvedTotal,
        solvedEasy: snap.solvedEasy,
        solvedMedium: snap.solvedMedium,
        solvedHard: snap.solvedHard,
        contestRating: snap.contestRating,
      };
    case "codeforces":
      return {
        ...base,
        cfRating: snap.cfRating,
        cfMaxRating: snap.cfMaxRating,
        cfRank: snap.cfRank,
        cfProblemsSolvedTotal: snap.cfProblemsSolvedTotal,
        cfSubmissions: snap.cfSubmissions,
      };
  }
}

function snapshotUpdate(
  platform: Platform,
  snap: DaySnapshot,
) {
  switch (platform) {
    case "github":
      return {
        commits: snap.commits ?? 0,
        pullRequests: snap.pullRequests ?? 0,
        prsMerged: snap.prsMerged ?? 0,
        issuesOpened: snap.issuesOpened ?? 0,
        reviews: snap.reviews ?? 0,
        starsReceived: snap.starsReceived,
        totalRepos: snap.totalRepos,
      };
    case "wakatime":
      return {
        codingSeconds: snap.codingSeconds ?? 0,
        topLanguage: snap.topLanguage,
        languages: (snap.languages as unknown as Prisma.InputJsonValue) ?? undefined,
      };
    case "leetcode":
      return {
        problemsSolvedTotal: snap.problemsSolvedTotal,
        solvedEasy: snap.solvedEasy,
        solvedMedium: snap.solvedMedium,
        solvedHard: snap.solvedHard,
        contestRating: snap.contestRating,
      };
    case "codeforces":
      return {
        cfRating: snap.cfRating,
        cfMaxRating: snap.cfMaxRating,
        cfRank: snap.cfRank,
        cfProblemsSolvedTotal: snap.cfProblemsSolvedTotal,
        cfSubmissions: snap.cfSubmissions,
      };
  }
}

/** Rota el refresh token de WakaTime (expiran en 2h, se refrescan en cada sync). */
async function refreshWakaTimeToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const res = await fetch("https://wakatime.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.WAKATIME_CLIENT_ID,
      client_secret: process.env.WAKATIME_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new AdapterError(
      `WakaTime rechazó el refresh token — reconecta tu cuenta desde Settings. ${text}`,
      true,
    );
  }

  return res.json();
}

// ──── Sincronización por plataforma ────

export async function syncGithubForUser(
  userId: string,
  trigger: SyncTrigger,
): Promise<{ ok: boolean; itemsSynced?: number; error?: string }> {
  const db = getDb();
  const account = await db.githubAccount.findUnique({ where: { userId } });
  if (!account) return { ok: false, error: "Sin cuenta de GitHub conectada" };

  const job = await db.syncJob.create({
    data: {
      userId,
      platform: "GITHUB",
      trigger,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });
  await db.githubAccount.update({
    where: { userId },
    data: { syncStatus: "SYNCING" },
  });

  try {
    const backfillDays = account.lastSyncedAt ? 3 : 365;
    const token = decryptToken(account.encryptedToken);
    const result = await githubAdapter.sync({ token, backfillDays });

    await writeSnapshots(userId, "github", result.snapshots);

    await db.githubAccount.update({
      where: { userId },
      data: {
        syncStatus: "IDLE",
        lastSyncedAt: new Date(),
        lastSyncError: null,
        consecutiveErrors: 0,
        ...(result.profile?.login ? { login: result.profile.login } : {}),
        ...(result.profile?.avatarUrl
          ? { avatarUrl: result.profile.avatarUrl }
          : {}),
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsSynced: result.snapshots.length,
      },
    });
    return { ok: true, itemsSynced: result.snapshots.length };
  } catch (err) {
    const message =
      err instanceof AdapterError
        ? err.message
        : "Error inesperado sincronizando GitHub";
    await db.githubAccount.update({
      where: { userId },
      data: {
        syncStatus: "ERROR",
        lastSyncError: message,
        consecutiveErrors: { increment: 1 },
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message },
    });
    return { ok: false, error: message };
  }
}

export async function syncWakatimeForUser(
  userId: string,
  trigger: SyncTrigger,
): Promise<{ ok: boolean; itemsSynced?: number; error?: string }> {
  const db = getDb();
  const account = await db.wakatimeAccount.findUnique({ where: { userId } });
  if (!account) return { ok: false, error: "Sin cuenta de WakaTime conectada" };

  const job = await db.syncJob.create({
    data: {
      userId,
      platform: "WAKATIME",
      trigger,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });
  await db.wakatimeAccount.update({
    where: { userId },
    data: { syncStatus: "SYNCING" },
  });

  try {
    // Rotar token si está por expirar (buffer de 5 min)
    let accessToken = decryptToken(account.encryptedAccessToken);
    const expiresIn = account.tokenExpiresAt.getTime() - Date.now();
    if (expiresIn < 300_000) {
      const newTokens = await refreshWakaTimeToken(
        decryptToken(account.encryptedRefreshToken),
      );
      accessToken = newTokens.access_token;
      await db.wakatimeAccount.update({
        where: { userId },
        data: {
          encryptedAccessToken: encryptToken(newTokens.access_token),
          encryptedRefreshToken: encryptToken(newTokens.refresh_token),
          tokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
        },
      });
    }

    const backfillDays = account.lastSyncedAt ? 2 : 14;
    const result = await wakatimeAdapter.sync({
      accessToken,
      backfillDays,
    });

    await writeSnapshots(userId, "wakatime", result.snapshots);

    await db.wakatimeAccount.update({
      where: { userId },
      data: {
        syncStatus: "IDLE",
        lastSyncedAt: new Date(),
        lastSyncError: null,
        consecutiveErrors: 0,
        ...(result.profile?.login
          ? { displayName: result.profile.login }
          : {}),
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsSynced: result.snapshots.length,
      },
    });
    return { ok: true, itemsSynced: result.snapshots.length };
  } catch (err) {
    const message =
      err instanceof AdapterError
        ? err.message
        : "Error inesperado sincronizando WakaTime";
    await db.wakatimeAccount.update({
      where: { userId },
      data: {
        syncStatus: "ERROR",
        lastSyncError: message,
        consecutiveErrors: { increment: 1 },
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message },
    });
    return { ok: false, error: message };
  }
}

export async function syncLeetcodeForUser(
  userId: string,
  trigger: SyncTrigger,
): Promise<{ ok: boolean; itemsSynced?: number; error?: string }> {
  const db = getDb();
  const account = await db.leetcodeAccount.findUnique({ where: { userId } });
  if (!account) return { ok: false, error: "Sin cuenta de LeetCode conectada" };

  const job = await db.syncJob.create({
    data: {
      userId,
      platform: "LEETCODE",
      trigger,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });
  await db.leetcodeAccount.update({
    where: { userId },
    data: { syncStatus: "SYNCING" },
  });

  try {
    const backfillDays = account.lastSyncedAt ? 1 : 365;
    const result = await leetcodeAdapter.sync({
      username: account.username,
      backfillDays,
    });

    await writeSnapshots(userId, "leetcode", result.snapshots);

    await db.leetcodeAccount.update({
      where: { userId },
      data: {
        syncStatus: "IDLE",
        lastSyncedAt: new Date(),
        lastSyncError: null,
        consecutiveErrors: 0,
        ...(result.profile?.login
          ? { username: result.profile.login }
          : {}),
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsSynced: result.snapshots.length,
      },
    });
    return { ok: true, itemsSynced: result.snapshots.length };
  } catch (err) {
    const message =
      err instanceof AdapterError
        ? err.message
        : "Error inesperado sincronizando LeetCode";
    await db.leetcodeAccount.update({
      where: { userId },
      data: {
        syncStatus: "ERROR",
        lastSyncError: message,
        consecutiveErrors: { increment: 1 },
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message },
    });
    return { ok: false, error: message };
  }
}

export async function syncCodeforcesForUser(
  userId: string,
  trigger: SyncTrigger,
): Promise<{ ok: boolean; itemsSynced?: number; error?: string }> {
  const db = getDb();
  const account = await db.codeforcesAccount.findUnique({ where: { userId } });
  if (!account)
    return { ok: false, error: "Sin cuenta de Codeforces conectada" };

  const job = await db.syncJob.create({
    data: {
      userId,
      platform: "CODEFORCES",
      trigger,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });
  await db.codeforcesAccount.update({
    where: { userId },
    data: { syncStatus: "SYNCING" },
  });

  try {
    const backfillDays = account.lastSyncedAt ? 1 : 365;
    const result = await codeforcesAdapter.sync({
      handle: account.handle,
      backfillDays,
    });

    await writeSnapshots(userId, "codeforces", result.snapshots);

    await db.codeforcesAccount.update({
      where: { userId },
      data: {
        syncStatus: "IDLE",
        lastSyncedAt: new Date(),
        lastSyncError: null,
        consecutiveErrors: 0,
        ...(result.profile?.login
          ? { handle: result.profile.login }
          : {}),
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        itemsSynced: result.snapshots.length,
      },
    });
    return { ok: true, itemsSynced: result.snapshots.length };
  } catch (err) {
    const message =
      err instanceof AdapterError
        ? err.message
        : "Error inesperado sincronizando Codeforces";
    await db.codeforcesAccount.update({
      where: { userId },
      data: {
        syncStatus: "ERROR",
        lastSyncError: message,
        consecutiveErrors: { increment: 1 },
      },
    });
    await db.syncJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message },
    });
    return { ok: false, error: message };
  }
}

/** Sincroniza una plataforma concreta (genérico, usado por cron y acciones). */
export async function syncPlatformForUser(
  userId: string,
  platform: Platform,
  trigger: SyncTrigger,
): Promise<{ ok: boolean; itemsSynced?: number; error?: string }> {
  switch (platform) {
    case "github":
      return syncGithubForUser(userId, trigger);
    case "wakatime":
      return syncWakatimeForUser(userId, trigger);
    case "leetcode":
      return syncLeetcodeForUser(userId, trigger);
    case "codeforces":
      return syncCodeforcesForUser(userId, trigger);
  }
}

// ──── Cron ────

const STALE_MS = 20 * 3600 * 1000; // >20h desde el último sync

export async function runCronSync(limit = 25): Promise<{
  processed: number;
  failed: number;
}> {
  const db = getDb();
  const staleBefore = new Date(Date.now() - STALE_MS);

  const [ghAccounts, wtAccounts, lcAccounts, cfAccounts] =
    await Promise.all([
      db.githubAccount.findMany({
        where: {
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: staleBefore } },
          ],
          consecutiveErrors: { lt: 3 },
        },
        orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
        take: limit,
        select: { userId: true },
      }),
      db.wakatimeAccount.findMany({
        where: {
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: staleBefore } },
          ],
          consecutiveErrors: { lt: 3 },
        },
        orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
        take: limit,
        select: { userId: true },
      }),
      db.leetcodeAccount.findMany({
        where: {
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: staleBefore } },
          ],
          consecutiveErrors: { lt: 3 },
        },
        orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
        take: limit,
        select: { userId: true },
      }),
      db.codeforcesAccount.findMany({
        where: {
          OR: [
            { lastSyncedAt: null },
            { lastSyncedAt: { lt: staleBefore } },
          ],
          consecutiveErrors: { lt: 3 },
        },
        orderBy: { lastSyncedAt: { sort: "asc", nulls: "first" } },
        take: limit,
        select: { userId: true },
      }),
    ]);

  let processed = 0;
  let failed = 0;

  for (const { userId } of ghAccounts) {
    processed++;
    const r = await syncGithubForUser(userId, "cron");
    if (!r.ok) failed++;
  }
  for (const { userId } of wtAccounts) {
    processed++;
    const r = await syncWakatimeForUser(userId, "cron");
    if (!r.ok) failed++;
  }
  for (const { userId } of lcAccounts) {
    processed++;
    const r = await syncLeetcodeForUser(userId, "cron");
    if (!r.ok) failed++;
  }
  for (const { userId } of cfAccounts) {
    processed++;
    const r = await syncCodeforcesForUser(userId, "cron");
    if (!r.ok) failed++;
  }

  return { processed, failed };
}
