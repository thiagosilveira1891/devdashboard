"use client";

import { useActionState } from "react";
import { connectCodeforces } from "@/app/actions/sync";
import { Button } from "@/components/ui/button";

const initialState = { ok: false, message: "" };

export function ConnectCodeforcesForm() {
  const [state, action, pending] = useActionState(
    async (_prev: typeof initialState, formData: FormData) => {
      const handle = formData.get("handle") as string;
      return connectCodeforces(handle);
    },
    initialState,
  );

  if (state.ok) {
    return (
      <span className="text-[11px] text-green-400 font-medium flex items-center gap-1">
        Conectado
      </span>
    );
  }

  return (
    <form action={action} className="flex items-center gap-1.5">
      <input
        name="handle"
        type="text"
        placeholder="tu-handle"
        className="w-[120px] h-7 rounded-md border border-border bg-background px-2 text-[12px] focus:outline-none focus:border-primary/50"
        disabled={pending}
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "…" : "OK"}
      </Button>
      {state.message && !state.ok && (
        <p className="text-[10px] text-red-400 absolute mt-12">{state.message}</p>
      )}
    </form>
  );
}
