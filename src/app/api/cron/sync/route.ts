import { NextResponse } from "next/server";
import { isDbEnabled } from "@/lib/db";
import { runCronSync } from "@/lib/sync/orchestrator";

// Vercel Cron llama aquí cada hora (ver vercel.json / PLANNING.md §6.5).
export const maxDuration = 300;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isDbEnabled()) {
    return NextResponse.json({ skipped: "modo demo: no hay base de datos" });
  }

  const result = await runCronSync();
  return NextResponse.json(result);
}
