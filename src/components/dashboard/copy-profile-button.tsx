"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyProfileButton({
  slug,
}: {
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={copy}
      className="h-8 gap-1.5 text-[12px]"
    >
      {copied ? (
        <Check className="size-3.5 text-green-400" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? "Copiado" : "Copiar perfil"}
    </Button>
  );
}
