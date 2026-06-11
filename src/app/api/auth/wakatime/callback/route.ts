import { NextResponse } from "next/server";
import { getDb, isDbEnabled } from "@/lib/db";
import { encryptToken } from "@/lib/crypto";
import { syncWakatimeForUser } from "@/lib/sync/orchestrator";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/onboarding?error=wakatime_denied", req.url),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=invalid_params", req.url),
    );
  }

  if (!isDbEnabled()) {
    return NextResponse.redirect(
      new URL("/onboarding?error=no_database", req.url),
    );
  }

  const userId = state;
  const db = getDb();

  try {
    const tokenRes = await fetch("https://wakatime.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.WAKATIME_CLIENT_ID,
        client_secret: process.env.WAKATIME_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/wakatime/callback`,
      }),
    });

    if (!tokenRes.ok) {
      throw new Error(`Token exchange failed: ${tokenRes.status}`);
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      uid: string;
    };

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Tokens faltantes en la respuesta de WakaTime");
    }

    const encryptedAccess = encryptToken(tokens.access_token);
    const encryptedRefresh = encryptToken(tokens.refresh_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await db.wakatimeAccount.upsert({
      where: { userId },
      create: {
        userId,
        wakatimeId: tokens.uid,
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: expiresAt,
      },
      update: {
        wakatimeId: tokens.uid,
        encryptedAccessToken: encryptedAccess,
        encryptedRefreshToken: encryptedRefresh,
        tokenExpiresAt: expiresAt,
        consecutiveErrors: 0,
        lastSyncError: null,
      },
    });

    syncWakatimeForUser(userId, "onboarding").catch((err) =>
      console.error("[wakatime] primer sync falló:", err),
    );
  } catch (err) {
    console.error("[wakatime] callback error:", err);
    return NextResponse.redirect(
      new URL("/onboarding/sync?error=wakatime_failed", req.url),
    );
  }

  return NextResponse.redirect(new URL("/onboarding/sync?wakatime=ok", req.url));
}
