import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/landing/code-block";

const REPO_URL = "https://github.com/thiago/devdashboard";

export function OpenSourceSection() {
  return (
    <section id="open-source" className="max-w-6xl mx-auto px-6 py-24 border-t border-[#27272a]">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#fafafa]">
            Open source.
            <br />
            Self-host in minutes.
          </h2>
          <p className="text-[14px] text-[#a1a1aa] mt-3 leading-relaxed max-w-md">
            Your data, your infrastructure. AGPL-3.0 licensed. No lock-in. No
            vendor dependence. The full product, forever.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <Button asChild size="sm" variant="outline" className="h-8 px-4 text-[12px] border-[#27272a] text-[#fafafa] hover:bg-[#111113] rounded-md">
              <Link href={REPO_URL} target="_blank" rel="noreferrer">
                View on GitHub
                <ArrowRight className="size-3 ml-1" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-8 px-4 text-[12px] text-[#a1a1aa] hover:text-[#fafafa]">
              <Link href="/docs/self-hosting">Self-hosting guide →</Link>
            </Button>
          </div>
        </div>

        <CodeBlock />
      </div>
    </section>
  );
}
