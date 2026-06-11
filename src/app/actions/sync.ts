"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";
import { syncPlatformForUser } from "@/lib/sync/orchestrator";
import type { Platform } from "@/lib/types";

const COOLDOWN_MS = 60 * 60 * 1000;

export async function refreshSync(
  platform?: Platform,
): Promise<{ ok: boolean; message: string }> {
  if (isDemoMode()) {
    return { ok: false, message: "Modo demo: los datos son de ejemplo" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sesión no válida" };

  const db = getDb();

  if (platform && platform !== "github") {
    let lastSyncedAt: Date | null = null;

    if (platform === "wakatime") {
      const acc = await db.wakatimeAccount.findUnique({ where: { userId } });
      if (!acc)
        return { ok: false, message: "Conecta WakaTime primero" };
      lastSyncedAt = acc.lastSyncedAt;
    } else if (platform === "leetcode") {
      const acc = await db.leetcodeAccount.findUnique({ where: { userId } });
      if (!acc)
        return { ok: false, message: "Conecta LeetCode primero" };
      lastSyncedAt = acc.lastSyncedAt;
    } else {
      const acc = await db.codeforcesAccount.findUnique({
        where: { userId },
      });
      if (!acc)
        return { ok: false, message: "Conecta Codeforces primero" };
      lastSyncedAt = acc.lastSyncedAt;
    }

    if (
      lastSyncedAt &&
      Date.now() - lastSyncedAt.getTime() < COOLDOWN_MS
    ) {
      const mins = Math.ceil(
        (COOLDOWN_MS - (Date.now() - lastSyncedAt.getTime())) / 60000,
      );
      return { ok: false, message: `Disponible en ${mins} min` };
    }

    const result = await syncPlatformForUser(userId, platform, "manual");
    revalidatePath("/dashboard");
    return result.ok
      ? { ok: true, message: "Sincronizado" }
      : { ok: false, message: result.error ?? "Error al sincronizar" };
  }

  const account = await db.githubAccount.findUnique({ where: { userId } });
  if (!account) return { ok: false, message: "Conecta GitHub primero" };

  if (
    account.lastSyncedAt &&
    Date.now() - account.lastSyncedAt.getTime() < COOLDOWN_MS
  ) {
    const mins = Math.ceil(
      (COOLDOWN_MS - (Date.now() - account.lastSyncedAt.getTime())) / 60000,
    );
    return { ok: false, message: `Disponible en ${mins} min` };
  }

  const result = await syncPlatformForUser(userId, "github", "manual");
  revalidatePath("/dashboard");
  return result.ok
    ? { ok: true, message: "Sincronizado" }
    : { ok: false, message: result.error ?? "Error al sincronizar" };
}

export async function connectLeetcode(
  username: string,
): Promise<{ ok: boolean; message: string }> {
  if (isDemoMode()) {
    return { ok: false, message: "Modo demo: no se pueden conectar cuentas" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sesión no válida" };

  const trimmed = username.trim();
  if (!trimmed) return { ok: false, message: "Ingresa un username" };

  const db = getDb();

  await db.leetcodeAccount.upsert({
    where: { userId },
    create: { userId, username: trimmed },
    update: { username: trimmed, consecutiveErrors: 0, lastSyncError: null },
  });

  syncPlatformForUser(userId, "leetcode", "onboarding").catch((err) =>
    console.error("[connect] primer sync de LeetCode falló:", err),
  );

  revalidatePath("/onboarding");
  return { ok: true, message: "LeetCode conectado" };
}

export async function connectCodeforces(
  handle: string,
): Promise<{ ok: boolean; message: string }> {
  if (isDemoMode()) {
    return { ok: false, message: "Modo demo: no se pueden conectar cuentas" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, message: "Sesión no válida" };

  const trimmed = handle.trim();
  if (!trimmed) return { ok: false, message: "Ingresa un handle" };

  const db = getDb();

  await db.codeforcesAccount.upsert({
    where: { userId },
    create: { userId, handle: trimmed },
    update: { handle: trimmed, consecutiveErrors: 0, lastSyncError: null },
  });

  syncPlatformForUser(userId, "codeforces", "onboarding").catch((err) =>
    console.error("[connect] primer sync de Codeforces falló:", err),
  );

  revalidatePath("/onboarding");
  return { ok: true, message: "Codeforces conectado" };
}
