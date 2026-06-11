import { addDays, toDateKey } from "@/lib/dates";
import type { DaySnapshot, LanguageSeconds } from "@/lib/types";
import { AdapterError, type PlatformAdapter, type SyncResult } from "./types";

/**
 * Adapter de WakaTime — OAuth 2.0 oficial (wakatime.com/api/v1).
 *
 * Usa el access token del usuario para obtener summaries diarios. El plan
 * gratuito solo conserva 14 días de historia — por eso los snapshots propios
 * son obligatorios desde el día 1.
 *
 * El adapter NO gestiona refresh de token. Eso lo hace el orquestador antes
 * de llamar a sync().
 */

export interface WakatimeSyncContext {
  accessToken: string;
  backfillDays: number;
}

const API_BASE = "https://wakatime.com/api/v1";

interface WakaSummary {
  grand_total: {
    digital: string;
    hours: number;
    minutes: number;
    text: string;
    total_seconds: number;
  };
  range: {
    date: string; // YYYY-MM-DD
    start: string;
    end: string;
    text: string;
    timezone: string;
  };
  languages?: { name: string; total_seconds: number; percent: number }[];
  projects?: { name: string; total_seconds: number; percent: number }[];
}

interface SummariesResponse {
  data: WakaSummary[];
  start: string;
  end: string;
  cumulative_total: {
    seconds: number;
    text: string;
    digital: string;
  };
}

interface UserResponse {
  data: {
    id: string;
    display_name: string;
    photo?: string;
  };
}

async function wakaApi<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "developer-dashboard (open source)",
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new AdapterError(
      "WakaTime rechazó el token — reconecta tu cuenta desde Settings.",
      true,
    );
  }
  if (!res.ok) {
    throw new AdapterError(`WakaTime respondió ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const wakatimeAdapter: PlatformAdapter<WakatimeSyncContext> = {
  platform: "wakatime",
  rateLimit: { maxConcurrent: 2, minDelayMs: 500 },
  backfillCapability: { maxDays: 14 },

  async sync({ accessToken, backfillDays }): Promise<SyncResult> {
    const days = Math.min(backfillDays, this.backfillCapability.maxDays);
    const now = new Date();
    const from = addDays(now, -(days - 1));
    const start = toDateKey(from);
    const end = toDateKey(now);

    const [summariesRes, profileRes] = await Promise.all([
      wakaApi<SummariesResponse>(
        accessToken,
        `/users/current/summaries?start=${start}&end=${end}`,
      ),
      wakaApi<UserResponse>(accessToken, "/users/current").catch(() => null),
    ]);

    const byDate = new Map<string, WakaSummary>();
    for (const s of summariesRes.data) {
      byDate.set(s.range.date, s);
    }

    const snapshots: DaySnapshot[] = [];
    for (let d = new Date(from); d <= now; d = addDays(d, 1)) {
      const dateKey = toDateKey(d);
      const summary = byDate.get(dateKey);
      const codingSeconds = summary
        ? Math.round(summary.grand_total.total_seconds)
        : 0;

      const languages: LanguageSeconds[] =
        summary?.languages?.map((l) => ({
          name: l.name,
          seconds: Math.round(l.total_seconds),
        })) ?? [];

      snapshots.push({
        date: dateKey,
        platform: "wakatime",
        codingSeconds,
        topLanguage: languages[0]?.name,
        languages,
      });
    }

    return {
      snapshots,
      profile: profileRes
        ? {
            login: profileRes.data.display_name,
            avatarUrl: profileRes.data.photo,
          }
        : undefined,
    };
  },
};
