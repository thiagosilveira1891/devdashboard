"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareProfileButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    const url = `${window.location.origin}/u/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function share() {
    const url = `${window.location.origin}/u/${slug}`;
    if (navigator.share) {
      navigator.share({ title: "Developer Dashboard", url });
    } else {
      copy();
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={share}
      className="gap-1.5 text-[12px]"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-400" />
          Copiado
        </>
      ) : (
        <>
          <Share2 className="size-3.5" />
          Compartir
        </>
      )}
    </Button>
  );
}
