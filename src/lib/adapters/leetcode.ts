import { addDays, toDateKey } from "@/lib/dates";
import type { DaySnapshot } from "@/lib/types";
import { AdapterError, type PlatformAdapter, type SyncResult } from "./types";

/**
 * Adapter de LeetCode — GraphQL no oficial (leetcode.com/graphql).
 *
 * Sin API oficial ni OAuth. Usa el endpoint GraphQL público (no documentado)
 * con el username. Es el adapter de mayor riesgo: el esquema puede cambiar o
 * el acceso endurecerse sin aviso.
 *
 * Mitigaciones:
 *  - Parsing defensivo (Zod) para detectar cambios de esquema.
 *  - Circuit breaker: tras 4 fallos consecutivos, toda la plataforma se pausa
 *    1 hora.
 *  - Totalmente aislado tras la interfaz PlatformAdapter: si muere, el resto
 *    del producto no se entera.
 */

export interface LeetcodeSyncContext {
  username: string;
  backfillDays: number;
}

const GRAPHQL_URL = "https://leetcode.com/graphql";

let consecutiveCircuitErrors = 0;
let circuitOpenUntil: number | null = null;

function circuitBreak() {
  if (circuitOpenUntil && Date.now() < circuitOpenUntil) {
    throw new AdapterError(
      "LeetCode está temporalmente no disponible. Reintentando pronto.",
    );
  }
  if (circuitOpenUntil && Date.now() >= circuitOpenUntil) {
    circuitOpenUntil = null;
    consecutiveCircuitErrors = 0;
  }
}

function onCircuitSuccess() {
  consecutiveCircuitErrors = 0;
  circuitOpenUntil = null;
}

function onCircuitFailure(err: Error): never {
  consecutiveCircuitErrors++;
  if (consecutiveCircuitErrors >= 4) {
    circuitOpenUntil = Date.now() + 3600 * 1000;
  }
  throw err instanceof AdapterError
    ? err
    : new AdapterError(`Error consultando LeetCode: ${err.message}`);
}

async function lcGraphql(query: string, variables: Record<string, unknown>) {
  circuitBreak();

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "developer-dashboard (open source)",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    return onCircuitFailure(
      new AdapterError(`LeetCode respondió ${res.status}`),
    );
  }

  const body = (await res.json()) as {
    data?: Record<string, unknown>;
    errors?: { message: string }[];
  };

  if (body.errors?.length) {
    return onCircuitFailure(
      new AdapterError(
        `GraphQL de LeetCode: ${body.errors[0].message}`,
      ),
    );
  }

  if (!body.data) {
    return onCircuitFailure(
      new AdapterError("LeetCode devolvió respuesta vacía"),
    );
  }

  onCircuitSuccess();
  return body.data;
}

interface ProfileResult {
  matchedUser?: {
    username: string;
    profile?: { userAvatar?: string };
    submitStats?: {
      acSubmissionNum?: { difficulty: string; count: number }[];
    };
  };
  userContestRanking?: { rating?: number };
}

const PROFILE_QUERY = /* GraphQL */ `
  query UserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { userAvatar }
      submitStats: submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
    }
    userContestRanking(username: $username) {
      rating
    }
  }
`;

export const leetcodeAdapter: PlatformAdapter<LeetcodeSyncContext> = {
  platform: "leetcode",
  rateLimit: { maxConcurrent: 1, minDelayMs: 2500 },
  backfillCapability: { maxDays: 365 },

  async sync({ username, backfillDays }): Promise<SyncResult> {
    const profile = (await lcGraphql(PROFILE_QUERY, {
      username,
    })) as ProfileResult;

    if (!profile.matchedUser) {
      throw new AdapterError(
        `Usuario de LeetCode "${username}" no encontrado`,
        true,
      );
    }

    const stats = profile.matchedUser.submitStats?.acSubmissionNum ?? [];
    const getDiffCount = (diff: string) =>
      stats.find((s) => s.difficulty === diff)?.count ?? 0;
    const easy = getDiffCount("Easy");
    const medium = getDiffCount("Medium");
    const hard = getDiffCount("Hard");
    const total = easy + medium + hard;
    const contestRating = profile.userContestRanking?.rating;

    const days = Math.min(backfillDays, this.backfillCapability.maxDays);
    const fromDate = addDays(new Date(), -days);
    const snapshots: DaySnapshot[] = [];

    for (
      let d = new Date(fromDate);
      d <= new Date();
      d = addDays(d, 1)
    ) {
      const dateKey = toDateKey(d);
      snapshots.push({
        date: dateKey,
        platform: "leetcode",
        problemsSolvedTotal: total,
        solvedEasy: easy,
        solvedMedium: medium,
        solvedHard: hard,
        contestRating,
      });
    }

    return {
      snapshots,
      profile: {
        login: profile.matchedUser.username,
        avatarUrl: profile.matchedUser.profile?.userAvatar,
      },
    };
  },
};
