import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { signIn } from "@/auth";
import { GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { isDemoMode } from "@/lib/demo";

const PLATFORMS = ["GitHub", "LeetCode", "Codeforces", "WakaTime"];

export function Hero() {
  const demo = isDemoMode();

  return (
    <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#7c3aed]/20 bg-[#7c3aed]/10 px-3 py-1 text-[11px] text-[#7c3aed] font-medium mb-6">
            <span className="size-1.5 rounded-full bg-[#7c3aed]" />
            OPEN SOURCE · AGPL-3.0
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-semibold tracking-tight text-[#fafafa] leading-[1.08]">
            Your entire developer
            <br />
            journey.
            <br />
            <span className="text-[#7c3aed]">One dashboard.</span>
          </h1>

          <p className="text-[15px] text-[#a1a1aa] mt-5 max-w-md leading-relaxed">
            Track commits, coding hours, problem solving, streaks and growth
            across every platform you use — with your history saved forever.
          </p>

          <div className="flex items-center gap-3 mt-8">
            {demo ? (
              <Button asChild size="lg" className="h-10 px-6 text-[14px] bg-[#fafafa] text-[#09090b] hover:bg-[#e4e4e7] rounded-md font-medium">
                <Link href="/dashboard">
                  View Demo
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("github", { redirectTo: "/onboarding" });
                }}
              >
                <Button type="submit" size="lg" className="h-10 px-6 text-[14px] bg-[#fafafa] text-[#09090b] hover:bg-[#e4e4e7] rounded-md font-medium">
                  <GithubIcon className="size-4 mr-1.5" />
                  Get Started
                </Button>
              </form>
            )}
            <Button asChild variant="outline" size="lg" className="h-10 px-6 text-[14px] border-[#27272a] text-[#fafafa] hover:bg-[#111113] rounded-md">
              <Link href="/dashboard">
                View Demo
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-5 mt-10 text-[12px] text-[#52525b]">
            {PLATFORMS.map((name, i) => (
              <span key={name} className="flex items-center gap-5">
                {i > 0 && <span className="size-1 rounded-full bg-[#27272a]" />}
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Dashboard preview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10 pointer-events-none hidden lg:block" 
               style={{ bottom: '-40px', height: '120px', top: 'auto' }} />
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
