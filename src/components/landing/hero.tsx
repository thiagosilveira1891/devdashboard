import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signIn } from "@/auth";
import { GithubIcon } from "@/components/icons";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { PLATFORMS } from "@/components/landing/data";
import { getDict } from "@/components/landing/i18n";
import { btnPrimary, btnSecondary } from "@/components/landing/styles";
import { isDemoMode } from "@/lib/demo";

export async function Hero() {
  const demo = isDemoMode();
  const t = await getDict();

  return (
    <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 lg:pt-24">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
        {/* Izquierda: copy */}
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-[#A1A1AA]">
            <span className="size-1.5 rounded-full bg-[#22C55E]" aria-hidden />
            {t.hero.eyebrow}
          </p>

          <h1 className="mt-6 text-[42px] font-semibold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] md:text-[56px] lg:text-[48px] xl:text-[56px]">
            {t.hero.title1} <br className="hidden lg:inline" />
            {t.hero.title2}
            <br />
            {t.hero.title3}
            <span
              aria-hidden
              className="ml-2 inline-block h-[0.8em] w-[3px] translate-y-[0.08em] bg-[#6366F1] animate-[landing-caret_1.1s_steps(1,end)_infinite]"
            />
          </h1>

          <p className="mt-6 max-w-[440px] text-[15px] leading-relaxed text-[#A1A1AA] md:text-base">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {demo ? (
              <Link href="/dashboard" className={`${btnPrimary} h-10`}>
                {t.hero.ctaDemo}
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/onboarding" });
                }}
              >
                <button type="submit" className={`${btnPrimary} h-10`}>
                  <GithubIcon className="size-4" />
                  {t.hero.ctaPrimary}
                </button>
              </form>
            )}
            <Link href="/dashboard" className={`${btnSecondary} h-10`}>
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <div className="mt-12">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#52525B]">
              {t.hero.pullsFrom}
            </p>
            <ul className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              {PLATFORMS.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center gap-2 text-[13px] text-[#A1A1AA]"
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                    aria-hidden
                  />
                  {p.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Derecha: el screenshot es la pieza central — sangra hacia el borde */}
        <div className="relative min-w-0 lg:-mr-16 xl:-mr-24">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
