import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { after } from "next/server";
import { encryptToken } from "@/lib/crypto";
import { getDb, isDbEnabled } from "@/lib/db";
import { syncGithubForUser } from "@/lib/sync/orchestrator";

/**
 * Auth.js v5 — login con GitHub.
 *
 * El mismo OAuth que loguea da el token para la API de GitHub: lo guardamos
 * cifrado en github_accounts y lanzamos el primer sync sin bloquear el login.
 *
 * En modo demo (sin DATABASE_URL) este módulo se configura igual pero nunca
 * se usa: las páginas sirven al usuario demo sin pasar por aquí.
 */

const dbEnabled = isDbEnabled();

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // En modo demo no hay login real; el fallback evita exigir AUTH_SECRET
  secret:
    process.env.AUTH_SECRET ??
    (dbEnabled ? undefined : "demo-mode-secret-no-usar-en-produccion"),
  ...(dbEnabled ? { adapter: PrismaAdapter(getDb()) } : {}),
  session: { strategy: dbEnabled ? "database" : "jwt" },
  providers: [
    GitHub({
      authorization: { params: { scope: "read:user user:email" } },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (user) session.user.id = user.id;
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (
        !dbEnabled ||
        account?.provider !== "github" ||
        !account.access_token ||
        !user.id
      ) {
        return;
      }
      const userId = user.id;
      const db = getDb();
      const encrypted = encryptToken(account.access_token);
      const login =
        typeof profile?.login === "string" ? profile.login : "unknown";

      await db.githubAccount.upsert({
        where: { userId },
        create: {
          userId,
          githubId: account.providerAccountId,
          login,
          avatarUrl: user.image,
          encryptedToken: encrypted,
          scopes: account.scope ?? "read:user",
        },
        update: {
          encryptedToken: encrypted,
          scopes: account.scope ?? "read:user",
          login,
        },
      });

      // Crear perfil público con slug por defecto (el login de GitHub)
      const defaultSlug = login !== "unknown" ? login : userId.slice(0, 8);
      await db.publicProfile.upsert({
        where: { userId },
        create: { userId, slug: defaultSlug },
        update: {}, // no sobreescribir slug si ya existe
      });

      // Primer sync en background: al terminar el onboarding ya hay datos
      after(() =>
        syncGithubForUser(userId, "onboarding").catch((err) =>
          console.error("[auth] primer sync de GitHub falló:", err),
        ),
      );
    },
  },
});
