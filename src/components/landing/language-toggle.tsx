"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/components/landing/actions";
import type { Locale } from "@/components/landing/locale";

/**
 * Conmutador EN / ES. Persiste el idioma vía Server Action y refresca el árbol
 * RSC para que el servidor vuelva a renderizar con el diccionario nuevo.
 */
export function LanguageToggle({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function select(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      data-pending={pending ? "" : undefined}
      className="flex h-8 items-center rounded-md border border-[#27272A] p-0.5 font-mono text-[11px] data-[pending]:opacity-60"
    >
      {(["en", "es"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => select(l)}
          aria-pressed={locale === l}
          className={`flex h-full items-center rounded px-2 uppercase transition-colors ${
            locale === l
              ? "bg-[#1C1C1F] text-[#FAFAFA]"
              : "text-[#52525B] hover:text-[#A1A1AA]"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
