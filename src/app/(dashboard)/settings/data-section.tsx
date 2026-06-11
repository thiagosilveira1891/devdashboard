"use client";

import { useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { exportUserData, deleteAccount } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DataSection() {
  const [exporting, startExport] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport() {
    startExport(async () => {
      try {
        const json = await exportUserData();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `devdashboard-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage("Exportado");
        setTimeout(() => setMessage(null), 2500);
      } catch {
        setMessage("Error al exportar");
        setTimeout(() => setMessage(null), 2500);
      }
    });
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startDelete(async () => {
      const result = await deleteAccount();
      if (!result.ok) {
        setMessage(result.message);
        setTimeout(() => setMessage(null), 2500);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Export */}
      <Card className="p-4 flex items-center gap-4">
        <Download className="size-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium">Exportar mis datos</p>
          <p className="text-[11px] text-muted-foreground">
            Descarga toda tu historia en JSON. Tus datos son tuyos.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0 text-[12px]"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? "…" : message ?? "Exportar"}
        </Button>
      </Card>

      {/* Delete account */}
      <Card className="p-4 flex items-center gap-4 border-red-500/25">
        <Trash2 className="size-4 text-red-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-red-400">
            Borrar cuenta
          </p>
          <p className="text-[11px] text-muted-foreground">
            Borra permanentemente tu cuenta y todos tus datos en cascada.
            Esta acción no se puede deshacer.
          </p>
        </div>
        <Button
          variant={confirmDelete ? "default" : "outline"}
          size="sm"
          className={`ml-auto shrink-0 text-[12px] ${confirmDelete ? "bg-red-600 hover:bg-red-700 text-white" : "border-red-500/25 text-red-400 hover:bg-red-500/10"}`}
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting
            ? "…"
            : confirmDelete
              ? "¿Confirmar?"
              : "Borrar"}
        </Button>
      </Card>
    </div>
  );
}
