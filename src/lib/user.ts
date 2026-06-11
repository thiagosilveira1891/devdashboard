import { auth } from "@/auth";
import { isDemoMode } from "@/lib/demo";
import type { DashboardUser } from "@/lib/types";
import { DEMO_USER } from "@/seed/demo-data";

/** Usuario actual para la UI. En modo demo siempre hay "sesión". */
export async function getCurrentUser(): Promise<DashboardUser | null> {
  if (isDemoMode()) return { ...DEMO_USER, profileSlug: "ada" };
  const session = await auth();
  if (!session?.user) return null;
  return {
    name: session.user.name ?? "Developer",
    username: session.user.email?.split("@")[0] ?? "dev",
    image: session.user.image ?? undefined,
  };
}
