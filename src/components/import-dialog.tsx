"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { upload } from "@vercel/blob/client";
import { UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  confirmImportAction,
  previewImportAction,
} from "@/app/(app)/import-actions";

type Preview = { toCreate: number; toUpdate: number; toDeactivate: number };
type FinalResult = { created: number; updated: number; deactivated: number };

type State =
  | { step: "idle" }
  | { step: "previewing" }
  | { step: "preview-error"; error: string }
  | { step: "preview-ready"; preview: Preview; blobUrl: string }
  | { step: "confirming" }
  | { step: "done"; result: FinalResult };

export function ImportDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>({ step: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setState({ step: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      const wasDone = state.step === "done";
      reset();
      if (wasDone) router.refresh();
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setState({ step: "previewing" });

    try {
      const blob = await upload(file.name, file, {
        access: "private",
        handleUploadUrl: "/api/upload",
      });

      const result = await previewImportAction(blob.url);

      if (!result.ok) {
        setState({ step: "preview-error", error: result.error });
        return;
      }
      setState({
        step: "preview-ready",
        preview: result.preview,
        blobUrl: blob.url,
      });
    } catch {
      setState({
        step: "preview-error",
        error:
          "No se pudo subir el archivo. Si es muy grande, intenta dividirlo en archivos más chicos.",
      });
    }
  }

  async function handleConfirm() {
    if (state.step !== "preview-ready") return;

    setState({ step: "confirming" });

    try {
      const result = await confirmImportAction(state.blobUrl);

      if (!result.ok) {
        setState({ step: "preview-error", error: result.error });
        return;
      }
      setState({ step: "done", result: result.result });
    } catch {
      setState({
        step: "preview-error",
        error: "Ocurrió un error al confirmar la importación. Intenta de nuevo.",
      });
    }
  }

  const busy = state.step === "previewing" || state.step === "confirming";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        size="sm"
        className="gap-1.5"
      >
        <UploadIcon />
        Importar CSV
      </Button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar Casos desde CSV</DialogTitle>
          <DialogDescription>
            Sube el archivo exportado del sistema de origen para crear y
            actualizar Casos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {state.step === "idle" || state.step === "preview-error" ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="csv-file">Archivo CSV</Label>
              <Input
                id="csv-file"
                ref={inputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
          ) : null}

          {busy && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {state.step === "previewing"
                  ? "Leyendo archivo…"
                  : "Confirmando importación…"}
              </p>
              {state.step === "confirming" && (
                <p className="text-xs text-muted-foreground">
                  Con archivos grandes puede tardar varios minutos. No cierres
                  esta ventana.
                </p>
              )}
              <div
                role="progressbar"
                aria-label={
                  state.step === "previewing"
                    ? "Leyendo archivo"
                    : "Confirmando importación"
                }
                className="relative h-1 w-full overflow-hidden rounded-full bg-muted"
              >
                <div className="absolute inset-y-0 w-1/3 animate-[indeterminate_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
              </div>
            </div>
          )}

          {state.step === "preview-error" && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          {state.step === "preview-ready" && (
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3 text-sm">
              <p>
                Se crearán: <strong>{state.preview.toCreate}</strong>
              </p>
              <p>
                Se actualizarán: <strong>{state.preview.toUpdate}</strong>
              </p>
              <p>
                Se desactivarán: <strong>{state.preview.toDeactivate}</strong>
              </p>
            </div>
          )}

          {state.step === "done" && (
            <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3 text-sm">
              <p>
                Creados: <strong>{state.result.created}</strong>
              </p>
              <p>
                Actualizados: <strong>{state.result.updated}</strong>
              </p>
              <p>
                Desactivados: <strong>{state.result.deactivated}</strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {state.step === "preview-ready" && (
            <>
              <Button variant="outline" onClick={reset}>
                Elegir otro archivo
              </Button>
              <Button onClick={handleConfirm}>Confirmar importación</Button>
            </>
          )}
          {state.step === "done" && (
            <Button onClick={() => handleOpenChange(false)}>Listo</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
