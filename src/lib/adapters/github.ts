import { addDays, toDateKey } from "@/lib/dates";
import type { DaySnapshot } from "@/lib/types";
import { AdapterError, type PlatformAdapter, type SyncResult } from "./types";

/**
 * Adapter de GitHub — GraphQL API v4 con el token OAuth del propio usuario.
 *
 * Cada usuario gasta su propio presupuesto (5.000 puntos/hora), así que el
 * rate limit escala con los usuarios y no hay cuello de botella global.
 *
 * Métricas por día: contributionCalendar (proxy de commits, el mismo número
 * del heatmap de GitHub) + PRs/issues/reviews bucketizados por occurredAt.
 * Gauges (stars, repos) solo en el snapshot de hoy.
 */

export interface GithubSyncContext {
  token: string;
  backfillDays: number;
}

const GRAPHQL_URL = "https://api.github.com/graphql";

const QUERY = /* GraphQL */ `
  query Sync($from: DateTime!, $to: DateTime!) {
    viewer {
      login
      avatarUrl
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        pullRequestContributions(first: 100) {
          nodes {
            occurredAt
          }
        }
        issueContributions(first: 100) {
          nodes {
            occurredAt
          }
        }
        pullRequestReviewContributions(first: 100) {
          nodes {
            occurredAt
          }
        }
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
          stargazerCount
        }
      }
    }
  }
`;

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface QueryResult {
  viewer: {
    login: string;
    avatarUrl: string;
    contributionsCollection: {
      contributionCalendar: {
        weeks: { contributionDays: ContributionDay[] }[];
      };
      pullRequestContributions: { nodes: { occurredAt: string }[] };
      issueContributions: { nodes: { occurredAt: string }[] };
      pullRequestReviewContributions: { nodes: { occurredAt: string }[] };
    };
    repositories: {
      totalCount: number;
      nodes: { stargazerCount: number }[];
    };
  };
}

async function graphql(token: string, from: Date, to: Date): Promise<QueryResult> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "developer-dashboard (open source)",
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { from: from.toISOString(), to: to.toISOString() },
    }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new AdapterError(
      "GitHub rechazó el token — reconecta tu cuenta desde Settings.",
      true,
    );
  }
  if (!res.ok) {
    throw new AdapterError(`GitHub respondió ${res.status}`);
  }

  const body = (await res.json()) as { data?: QueryResult; errors?: { message: string }[] };
  if (body.errors?.length || !body.data) {
    throw new AdapterError(
      `Error de GraphQL de GitHub: ${body.errors?.[0]?.message ?? "respuesta vacía"}`,
    );
  }
  return body.data;
}

function bucketByDay(nodes: { occurredAt: string }[]): Map<string, number> {
  const buckets = new Map<string, number>();
  for (const { occurredAt } of nodes) {
    const key = occurredAt.slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return buckets;
}

export const githubAdapter: PlatformAdapter<GithubSyncContext> = {
  platform: "github",
  rateLimit: { maxConcurrent: 4, minDelayMs: 0 },
  backfillCapability: { maxDays: 365 },

  async sync({ token, backfillDays }): Promise<SyncResult> {
    const days = Math.min(backfillDays, this.backfillCapability.maxDays);
    const to = new Date();
    const from = addDays(to, -days);

    const data = await graphql(token, from, to);
    const cc = data.viewer.contributionsCollection;

    const prsByDay = bucketByDay(cc.pullRequestContributions.nodes);
    const issuesByDay = bucketByDay(cc.issueContributions.nodes);
    const reviewsByDay = bucketByDay(cc.pullRequestReviewContributions.nodes);

    const snapshots: DaySnapshot[] = [];
    for (const week of cc.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        snapshots.push({
          date: day.date,
          platform: "github",
          commits: day.contributionCount,
          pullRequests: prsByDay.get(day.date) ?? 0,
          prsMerged: prsByDay.get(day.date) ?? 0,
          issuesOpened: issuesByDay.get(day.date) ?? 0,
          reviews: reviewsByDay.get(day.date) ?? 0,
        });
      }
    }

    // Gauges del día de hoy
    const todayItem = snapshots.find((s) => s.date === toDateKey(to));
    const stars = data.viewer.repositories.nodes.reduce(
      (sum, repo) => sum + repo.stargazerCount,
      0,
    );
    if (todayItem) {
      todayItem.starsReceived = stars;
      todayItem.totalRepos = data.viewer.repositories.totalCount;
    }

    return {
      snapshots,
      profile: {
        login: data.viewer.login,
        avatarUrl: data.viewer.avatarUrl,
      },
    };
  },
};
