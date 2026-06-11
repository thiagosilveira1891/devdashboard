import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GithubIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const REPO_URL = "https://github.com/thiago/devdashboard";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#27272a] bg-[#09090b]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="size-6 rounded bg-[#7c3aed]/15 border border-[#7c3aed]/30 grid place-items-center">
              <span className="text-[#7c3aed] text-[10px] font-mono font-semibold">
                {"</>"}
              </span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-[#fafafa]">
              DevDash
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: "Features", href: "#features" },
              { label: "Analytics", href: "#analytics" },
              { label: "Open Source", href: "#open-source" },
              { label: "Self Host", href: "#self-host" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-[12px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          >
            <GithubIcon className="size-3.5" />
            <span className="font-mono tabular-nums">0</span>
          </a>
          <Button
            asChild
            size="sm"
            className="h-8 px-4 text-[12px] bg-[#fafafa] text-[#09090b] hover:bg-[#e4e4e7] rounded-md font-medium"
          >
            <Link href="/dashboard">
              Get Started
              <ArrowRight className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
