"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/components/landing/locale";

/** Persiste el idioma elegido en la cookie. Lo invoca el toggle del navbar. */
export async function setLocale(locale: Locale) {
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
