import type { Metadata } from "next";
import { OnboardingSync } from "./sync-client";

export const metadata: Metadata = { title: "Sincronizando…" };

export default function SyncPage() {
  return <OnboardingSync />;
}
