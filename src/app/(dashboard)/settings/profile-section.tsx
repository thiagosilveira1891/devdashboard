"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateProfile } from "@/app/actions/settings";

interface Props {
  slug: string | null;
  isPublic: boolean;
  showGithub: boolean;
  showWakatime: boolean;
  showLeetcode: boolean;
  showCodeforces: boolean;
}

export function ProfileSection({
  slug: initialSlug,
  isPublic: initialPublic,
  showGithub,
  showWakatime,
  showLeetcode,
  showCodeforces,
}: Props) {
  const [slug, setSlug] = useState(initialSlug ?? "");
  const [saving, startSaving] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save(fields: Record<string, string | boolean>) {
    startSaving(async () => {
      const result = await updateProfile(fields);
      setMessage(result.message);
      setTimeout(() => setMessage(null), 2500);
    });
  }

  return (
    <div className="space-y-3">
      {/* Slug */}
      <Card className="p-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium">Slug del perfil</p>
          <p className="text-[11px] text-muted-foreground">
            devdash.app/u/<span className="text-primary font-medium">{slug || "..."}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30))}
            className="w-[140px] h-7 rounded-md border border-border bg-background px-2 text-[12px] focus:outline-none focus:border-primary/50"
            placeholder="tu-slug"
          />
          <Button
            variant="outline"
            size="sm"
            disabled={saving || slug === initialSlug || !slug}
            onClick={() => save({ slug })}
            className="text-[11px] h-7"
          >
            {saving ? "…" : "Guardar"}
          </Button>
        </div>
      </Card>

      {/* Public toggle */}
      <Card className="p-4 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium">Perfil público</p>
          <p className="text-[11px] text-muted-foreground">
            {initialPublic
              ? "Tu perfil es visible en devdash.app/u/" + (initialSlug ?? "...")
              : "Actívalo para compartir tu perfil"}
          </p>
        </div>
        <Button
          variant={initialPublic ? "default" : "outline"}
          size="sm"
          className="ml-auto shrink-0 text-[11px]"
          onClick={() => save({ isPublic: !initialPublic })}
          disabled={saving || !initialSlug}
        >
          {initialPublic ? "Público" : "Privado"}
        </Button>
      </Card>

      {/* Platform visibility */}
      <Card className="p-4">
        <p className="text-[13px] font-medium mb-3">Visibilidad por plataforma</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Elegí qué plataformas se muestran en tu perfil público.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "showGithub", label: "GitHub", value: showGithub },
            { key: "showWakatime", label: "WakaTime", value: showWakatime },
            { key: "showLeetcode", label: "LeetCode", value: showLeetcode },
            { key: "showCodeforces", label: "Codeforces", value: showCodeforces },
          ].map(({ key, label, value }) => (
            <Button
              key={key}
              variant={value ? "default" : "outline"}
              size="sm"
              className="text-[11px] justify-start"
              onClick={() => save({ [key]: !value })}
              disabled={saving}
            >
              {value && <Check className="size-3 mr-1" />}
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {message && (
        <p className="text-[11px] text-primary font-medium">{message}</p>
      )}
    </div>
  );
}
