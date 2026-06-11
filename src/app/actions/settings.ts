"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

export async function disconnectPlatform(
  platform: string,
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sin sesión" };

  const db = getDb();

  try {
    switch (platform) {
      case "wakatime": {
        await db.wakatimeAccount.deleteMany({ where: { userId } });
        break;
      }
      case "leetcode": {
        await db.leetcodeAccount.deleteMany({ where: { userId } });
        break;
      }
      case "codeforces": {
        await db.codeforcesAccount.deleteMany({ where: { userId } });
        break;
      }
      default:
        return { ok: false, message: "Plataforma no válida" };
    }
    revalidatePath("/settings");
    return { ok: true, message: "Desconectado" };
  } catch {
    return { ok: false, message: "Error al desconectar" };
  }
}

export async function exportUserData(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Sin sesión");

  const db = getDb();
  const [user, snapshots, gh, wt, lc, cf] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.dailySnapshot.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    db.githubAccount.findUnique({ where: { userId } }),
    db.wakatimeAccount.findUnique({ where: { userId } }),
    db.leetcodeAccount.findUnique({ where: { userId } }),
    db.codeforcesAccount.findUnique({ where: { userId } }),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    user: {
      name: user?.name,
      username: user?.username,
      createdAt: user?.createdAt,
    },
    platforms: {
      github: gh ? { login: gh.login, lastSyncedAt: gh.lastSyncedAt } : null,
      wakatime: wt
        ? { displayName: wt.displayName, lastSyncedAt: wt.lastSyncedAt }
        : null,
      leetcode: lc ? { username: lc.username, lastSyncedAt: lc.lastSyncedAt } : null,
      codeforces: cf
        ? { handle: cf.handle, lastSyncedAt: cf.lastSyncedAt }
        : null,
    },
    snapshots: snapshots.map((s) => ({
      date: s.date,
      platform: s.platform,
      commits: s.commits,
      codingSeconds: s.codingSeconds,
      languages: s.languages,
      problemsSolvedTotal: s.problemsSolvedTotal,
      solvedEasy: s.solvedEasy,
      solvedMedium: s.solvedMedium,
      solvedHard: s.solvedHard,
      contestRating: s.contestRating,
      cfRating: s.cfRating,
      cfMaxRating: s.cfMaxRating,
      cfRank: s.cfRank,
      cfProblemsSolvedTotal: s.cfProblemsSolvedTotal,
      cfSubmissions: s.cfSubmissions,
    })),
  };

  return JSON.stringify(data, null, 2);
}

export async function deleteAccount(): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sin sesión" };

  try {
    const db = getDb();
    await db.user.delete({ where: { id: userId } });
  } catch {
    return { ok: false, message: "Error al borrar la cuenta" };
  }

  redirect("/");
}

export async function updateProfile(
  fields: Record<string, string | boolean>,
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sin sesión" };

  const db = getDb();

  try {
    const data: Record<string, unknown> = {};
    if (typeof fields.slug === "string") {
      const existing = await db.publicProfile.findUnique({
        where: { slug: fields.slug },
      });
      if (existing && existing.userId !== userId) {
        return { ok: false, message: "Ese slug ya está en uso" };
      }
      data.slug = fields.slug;
    }
    if (typeof fields.isPublic === "boolean") data.isPublic = fields.isPublic;
    if (typeof fields.showGithub === "boolean") data.showGithub = fields.showGithub;
    if (typeof fields.showWakatime === "boolean") data.showWakatime = fields.showWakatime;
    if (typeof fields.showLeetcode === "boolean") data.showLeetcode = fields.showLeetcode;
    if (typeof fields.showCodeforces === "boolean") data.showCodeforces = fields.showCodeforces;

    await db.publicProfile.upsert({
      where: { userId },
      create: { userId, slug: fields.slug as string ?? userId.slice(0, 8), ...data },
      update: data,
    });

    revalidatePath("/settings");
    return { ok: true, message: "Guardado" };
  } catch {
    return { ok: false, message: "Error al guardar" };
  }
}

