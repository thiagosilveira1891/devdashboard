import { addDays, toDateKey } from "@/lib/dates";
import type { DaySnapshot } from "@/lib/types";
import { AdapterError, type PlatformAdapter, type SyncResult } from "./types";

/**
 * Adapter de Codeforces — API pública oficial (codeforces.com/api).
 *
 * Sin auth para datos públicos. Rate limit estricto: 1 request cada 2 segundos
 * (presupuesto global de la app → throttle secuencial).
 *
 * Métricas: user.info (rating actual, maxRating, rank), user.rating (historial
 * completo de rating), user.status (submissions paginadas para bucket diario).
 * Backfill completo: la API devuelve todo el historial desde el día 1.
 */

export interface CodeforcesSyncContext {
  handle: string;
  backfillDays: number;
}

const API_BASE = "https://codeforces.com/api";

let lastRequest = 0;
const MIN_DELAY = 2100;

async function cfWait() {
  const now = Date.now();
  const wait = Math.max(0, lastRequest + MIN_DELAY - now);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
}

async function cfApi<T>(path: string): Promise<T> {
  await cfWait();
  const res = await fetch(`${API_BASE}/${path}`);
  if (!res.ok) {
    throw new AdapterError(`Codeforces respondió ${res.status}`);
  }
  const body = (await res.json()) as {
    status: string;
    result?: T;
    comment?: string;
  };
  if (body.status !== "OK" || !body.result) {
    throw new AdapterError(
      `Codeforces API: ${body.comment ?? "error desconocido"}`,
    );
  }
  return body.result;
}

interface CfUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  maxRank?: string;
  rank?: string;
  avatar?: string;
}

interface CfRatingChange {
  contestId: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

interface CfSubmission {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  problem: { contestId?: number; index: string };
  verdict?: string;
}

function cfRankFor(rating: number): string {
  if (rating < 1200) return "newbie";
  if (rating < 1400) return "pupil";
  if (rating < 1600) return "specialist";
  if (rating < 1900) return "expert";
  if (rating < 2100) return "candidate master";
  if (rating < 2300) return "master";
  if (rating < 2400) return "international master";
  return "grandmaster";
}

export const codeforcesAdapter: PlatformAdapter<CodeforcesSyncContext> = {
  platform: "codeforces",
  rateLimit: { maxConcurrent: 1, minDelayMs: 2100 },
  backfillCapability: { maxDays: 9999 },

  async sync({ handle, backfillDays }): Promise<SyncResult> {
    const users = await cfApi<CfUser[]>(
      `user.info?handles=${encodeURIComponent(handle)}`,
    );
    if (!users.length) {
      throw new AdapterError(
        `Usuario de Codeforces "${handle}" no encontrado`,
        true,
      );
    }
    const user = users[0];

    const ratingChanges =
      await cfApi<CfRatingChange[]>(`user.rating?handle=${encodeURIComponent(handle)}`);

    const fromDate = addDays(new Date(), -Math.min(backfillDays, 365 * 5));
    const fromTs = Math.floor(fromDate.getTime() / 1000);

    const submissions: CfSubmission[] = [];
    let from = 1;
    while (from <= 5000) {
      const batch = await cfApi<CfSubmission[]>(
        `user.status?handle=${encodeURIComponent(handle)}&from=${from}&count=100`,
      );
      if (!batch.length) break;
      submissions.push(...batch);
      if (batch.length < 100) break;
      if (batch[batch.length - 1].creationTimeSeconds < fromTs) break;
      from += 100;
    }

    const subsByDay = new Map<string, number>();
    const solvedKeys = new Set<string>();
    for (const sub of submissions) {
      if (sub.creationTimeSeconds < fromTs) continue;
      const key = toDateKey(new Date(sub.creationTimeSeconds * 1000));
      subsByDay.set(key, (subsByDay.get(key) ?? 0) + 1);
      if (sub.verdict === "OK") {
        solvedKeys.add(`${sub.problem.contestId ?? 0}-${sub.problem.index}`);
      }
    }

    const ratingAtDate = new Map<string, number>();
    for (const rc of ratingChanges) {
      const key = toDateKey(new Date(rc.ratingUpdateTimeSeconds * 1000));
      ratingAtDate.set(key, rc.newRating);
    }

    const snapshots: DaySnapshot[] = [];
    let lastRating: number | undefined;
    for (
      let d = new Date(fromDate);
      d <= new Date();
      d = addDays(d, 1)
    ) {
      const dateKey = toDateKey(d);
      const dayRating = ratingAtDate.get(dateKey) ?? lastRating;
      if (ratingAtDate.has(dateKey)) lastRating = dayRating;

      snapshots.push({
        date: dateKey,
        platform: "codeforces",
        cfRating: dayRating,
        cfMaxRating: user.maxRating,
        cfRank: dayRating ? cfRankFor(dayRating) : user.rank,
        cfProblemsSolvedTotal: solvedKeys.size,
        cfSubmissions: subsByDay.get(dateKey) ?? 0,
      });
    }

    return {
      snapshots,
      profile: {
        login: user.handle,
        avatarUrl: user.avatar,
      },
    };
  },
};
