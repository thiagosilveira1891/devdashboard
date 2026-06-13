"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { REPO_URL } from "@/components/landing/data";

const COPY_TEXT = `git clone ${REPO_URL}.git
cd devdashboard
docker compose up -d`;

/** Terminal de self-hosting: tres comandos y el servicio levantado. */
export function CodeBlock() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(COPY_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#27272A] bg-[#0C0C0E]">
      <div className="flex items-center justify-between border-b border-[#27272A] px-4 py-2.5">
        <span className="font-mono text-[11px] text-[#52525B]">~/devdash</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-[11px] text-[#A1A1AA] transition-colors hover:text-[#FAFAFA]"
        >
          {copied ? (
            <>
              <Check className="size-3 text-[#22C55E]" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4">
        <pre className="font-mono text-[12px] leading-[1.8] text-[#A1A1AA]">
          <span className="text-[#52525B]">$</span>{" "}
          <span className="text-[#22C55E]">git</span>{" "}
          <span className="text-[#E4E4E7]">clone {REPO_URL}.git</span>
          {"\n"}
          <span className="text-[#52525B]">$</span>{" "}
          <span className="text-[#22C55E]">cd</span>{" "}
          <span className="text-[#E4E4E7]">devdashboard</span>
          {"\n"}
          <span className="text-[#52525B]">$</span>{" "}
          <span className="text-[#22C55E]">docker</span>{" "}
          <span className="text-[#E4E4E7]">compose up -d</span>
          {"\n"}
          <span className="text-[#22C55E]">  ✔</span> devdash{"    "}
          <span className="text-[#52525B]">running on :3000</span>
          {"\n"}
          <span className="text-[#22C55E]">  ✔</span> postgres{"   "}
          <span className="text-[#52525B]">healthy</span>
          {"\n"}
          <span className="text-[#52525B]">$</span>{" "}
          <span
            aria-hidden
            className="inline-block h-[1.1em] w-[7px] translate-y-[0.2em] bg-[#6366F1] animate-[landing-caret_1.1s_steps(1,end)_infinite]"
          />
        </pre>
      </div>
    </div>
  );
}
