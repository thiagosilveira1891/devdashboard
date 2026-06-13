import Link from "next/link";
import { Star } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { LogoMark } from "@/components/landing/logo";
import { REPO_URL } from "@/components/landing/data";
import { btnPrimary } from "@/components/landing/styles";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Open Source", href: "#open-source" },
  { label: "Self Host", href: "#self-host" },
];

/** Estrellas reales del repo; si la API falla, el chip muestra solo "Star". */
async function fetchStars(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/thiago/devdashboard",
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    const n = data.stargazers_count;
    if (typeof n !== "number") return null;
    return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
  } catch {
    return null;
  }
}

export async function Navbar() {
  const stars = await fetchStars();

  return (
    <header className="sticky top-0 z-50 border-b border-[#27272A]/80 bg-[#09090B]/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[15px] font-semibold tracking-tight text-[#FAFAFA]">
            DevDash
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center gap-2 rounded-md border border-[#27272A] px-3 text-[12px] text-[#A1A1AA] transition-colors hover:border-[#3F3F46] hover:text-[#FAFAFA] sm:flex"
          >
            <GithubIcon className="size-3.5" />
            {stars ? (
              <span className="flex items-center gap-1 font-mono tabular-nums">
                <Star className="size-3 text-[#52525B]" />
                {stars}
              </span>
            ) : (
              <span>Star</span>
            )}
          </a>
          <Link
            href="/dashboard"
            className="hidden text-[13px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA] sm:block"
          >
            Log in
          </Link>
          <Link href="/dashboard" className={`${btnPrimary} h-8 px-3.5 text-[12px]`}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
