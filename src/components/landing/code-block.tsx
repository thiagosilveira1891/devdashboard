"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

const CODE = `# Clone and run
git clone https://github.com/thiago/devdashboard
cd devdashboard
pnpm install
pnpm dev

# That's it. Opens with demo data.
# Configure .env for production.`;

export function CodeBlock() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative rounded-lg border border-[#27272a] bg-[#0c0c0e] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#27272a]">
        <span className="text-[11px] text-[#52525b] font-mono">terminal</span>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-[11px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          {copied ? (
            <>
              <Check className="size-3" />
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
      <div className="p-4 overflow-x-auto">
        <pre className="text-[12px] font-mono text-[#a1a1aa] leading-relaxed whitespace-pre">
          <span className="text-[#52525b]"># Clone and run</span>
          {"\n"}
          <span className="text-[#22c55e]">git clone</span>{" "}
          <span className="text-[#fafafa]">https://github.com/thiago/devdashboard</span>
          {"\n"}
          <span className="text-[#22c55e]">cd</span>{" "}
          <span className="text-[#fafafa]">devdashboard</span>
          {"\n"}
          <span className="text-[#22c55e]">pnpm install</span>
          {"\n"}
          <span className="text-[#22c55e]">pnpm dev</span>
          {"\n\n"}
          <span className="text-[#52525b]"># That&apos;s it. Opens with demo data.</span>
          {"\n"}
          <span className="text-[#52525b]"># Configure .env for production.</span>
        </pre>
      </div>
    </div>
  );
}
