import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/landing/code-block";
import { REPO_URL } from "@/components/landing/data";
import { btnSecondary, eyebrow } from "@/components/landing/styles";

const FACTS = [
  { value: "AGPL-3.0", label: "license" },
  { value: "Docker", label: "one-command deploy" },
  { value: "Postgres", label: "your data, your db" },
];

export function OpenSourceSection() {
  return (
    <section id="open-source" className="border-t border-[#27272A] scroll-mt-14">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2">
        <div>
          <p className={eyebrow}>OPEN SOURCE</p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-tight text-[#FAFAFA] md:text-[36px]">
            Own your data.
            <br />
            Self-host in minutes.
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[#A1A1AA]">
            DevDash is AGPL-3.0 licensed. Run it on your own infrastructure
            with Docker — your metrics live in your Postgres, not ours. The
            full product, no paywalled tiers.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className={`${btnSecondary} h-9`}
            >
              View on GitHub
              <ArrowRight className="size-3.5" />
            </a>
            <Link
              href="/docs/self-hosting"
              className="text-[13px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
            >
              Self-hosting docs →
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {FACTS.map((f) => (
              <div
                key={f.value}
                className="flex flex-col rounded-md border border-[#27272A] bg-[#111113] px-3 py-2.5"
              >
                <dt className="order-2 font-mono text-[10px] text-[#52525B]">
                  {f.label}
                </dt>
                <dd className="order-1 font-mono text-[13px] font-medium text-[#FAFAFA]">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div id="self-host" className="scroll-mt-24">
          <CodeBlock />
        </div>
      </div>
    </section>
  );
}
