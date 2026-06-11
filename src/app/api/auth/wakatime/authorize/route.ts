import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const clientId = process.env.WAKATIME_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "WAKATIME_CLIENT_ID no está configurada" },
      { status: 500 },
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sin sesión" }, { status: 401 });
  }

  const redirectUri = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/wakatime/callback`;
  const state = session.user.id;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "read_logged_time",
    state,
  });

  return NextResponse.redirect(
    `https://wakatime.com/oauth/authorize?${params.toString()}`,
  );
}
