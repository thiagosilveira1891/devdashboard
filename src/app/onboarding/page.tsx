import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { isDemoMode } from "@/lib/demo";
import { isDbEnabled } from "@/lib/db";
import { ConnectLeetcodeForm } from "./connect-leetcode-form";
import { ConnectCodeforcesForm } from "./connect-codeforces-form";
import { OnboardingState } from "./state";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; wakatime?: string }>;
}) {
  const demo = isDemoMode();
  if (demo) redirect("/dashboard");

  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const params = await searchParams;
  const userId = session.user.id;

  let gh = false;
  let wt = false;
  let lc = false;
  let cf = false;
  let wtConnecting = false;

  if (isDbEnabled()) {
    const { getDb } = await import("@/lib/db");
    const db = getDb();
    const [ghAcc, wtAcc, lcAcc, cfAcc] = await Promise.all([
      db.githubAccount.findUnique({ where: { userId } }),
      db.wakatimeAccount.findUnique({ where: { userId } }),
      db.leetcodeAccount.findUnique({ where: { userId } }),
      db.codeforcesAccount.findUnique({ where: { userId } }),
    ]);
    gh = !!ghAcc;
    wt = !!wtAcc;
    lc = !!lcAcc;
    cf = !!cfAcc;
    wtConnecting = wtAcc?.syncStatus === "SYNCING";
  }

  const allConnected = gh && wt && lc && cf;
  const wakatimeOk = params.wakatime === "ok";
  const error = params.error;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-lg mx-auto w-full">
        <FadeIn>
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Conecta tus plataformas
          </h1>
          <p className="text-muted-foreground text-[14px] text-center mt-2 mb-10">
            Cuantas más conectes, más rico será tu dashboard.
          </p>
        </FadeIn>

        {error && (
          <FadeIn>
            <div className="w-full rounded-md border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-[12px] text-red-400 mb-6">
              {error === "wakatime_denied"
                ? "No autorizaste la conexión con WakaTime."
                : error === "wakatime_failed"
                  ? "Error al conectar WakaTime. Intenta de nuevo."
                  : "Error al conectar. Intenta de nuevo."}
            </div>
          </FadeIn>
        )}

        {wakatimeOk && (
          <FadeIn>
            <div className="w-full rounded-md border border-green-500/25 bg-green-500/10 px-4 py-2.5 text-[12px] text-green-400 mb-6">
              WakaTime conectado correctamente. Sincronizando tus datos…
            </div>
          </FadeIn>
        )}

        <OnboardingState
          wt={wt}
          lc={lc}
          cf={cf}
          wtConnecting={wtConnecting}
          connectLeetcodeForm={<ConnectLeetcodeForm />}
          connectCodeforcesForm={<ConnectCodeforcesForm />}
        />

        <FadeIn delay={0.3} className="mt-10 w-full flex flex-col gap-3">
          {allConnected ? (
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                Ir al dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="gap-2" variant="secondary">
              <Link href="/dashboard">
                Continuar al dashboard
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          )}
          <p className="text-[12px] text-muted-foreground text-center">
            Podés conectar más plataformas luego desde Settings.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
