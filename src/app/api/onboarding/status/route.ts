import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, isDbEnabled } from "@/lib/db";

export async function GET() {
  if (!isDbEnabled()) {
    return NextResponse.json([]);
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json([]);

  const db = getDb();
  const [gh, wt, lc, cf, jobs] = await Promise.all([
    db.githubAccount.findUnique({ where: { userId } }),
    db.wakatimeAccount.findUnique({ where: { userId } }),
    db.leetcodeAccount.findUnique({ where: { userId } }),
    db.codeforcesAccount.findUnique({ where: { userId } }),
    db.syncJob.findMany({
      where: { userId, trigger: "onboarding" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const jobByPlatform = new Map(
    jobs.map((j) => [j.platform.toLowerCase(), j]),
  );

  const status = (acc: {
    syncStatus: string;
  } | null): "pending" | "running" | "success" | "error" => {
    if (!acc) return "pending";
    if (acc.syncStatus === "SYNCING") return "running";
    if (acc.syncStatus === "ERROR") return "error";
    return "success";
  };

  return NextResponse.json([
    {
      platform: "github",
      label: "GitHub",
      status: status(gh),
      items: jobByPlatform.get("github")?.itemsSynced ?? undefined,
    },
    {
      platform: "wakatime",
      label: "WakaTime",
      status: status(wt),
      items: jobByPlatform.get("wakatime")?.itemsSynced ?? undefined,
    },
    {
      platform: "leetcode",
      label: "LeetCode",
      status: status(lc),
      items: jobByPlatform.get("leetcode")?.itemsSynced ?? undefined,
    },
    {
      platform: "codeforces",
      label: "Codeforces",
      status: status(cf),
      items: jobByPlatform.get("codeforces")?.itemsSynced ?? undefined,
    },
  ]);
}
