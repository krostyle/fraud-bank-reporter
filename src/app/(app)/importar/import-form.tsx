"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { confirmImportAction, previewImportAction } from "./actions";

type Preview = { toCreate: number; toUpdate: number; toDeactivate: number };
type FinalResult = { created: number; updated: number; deactivated: number };

type State =
  | { step: "idle" }
  | { step: "previewing" }
  | { step: "preview-error"; error: string }
  | { step: "preview-ready"; preview: Preview; content: string }
  | { step: "confirming" }
  | { step: "done"; result: FinalResult };

export function ImportForm() {
  const [state, setState] = useState<State>({ step: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setState({ step: "previewing" });

    const formData = new FormData();
    formData.set("file", file);
    const result = await previewImportAction(formData);

    if (!result.ok) {
      setState({ step: "preview-error", error: result.error });
      return;
    }
    setState({
      step: "preview-ready",
      preview: result.preview,
      content: result.content,
    });
  }

  async function handleConfirm() {
    if (state.step !== "preview-ready") return;

    setState({ step: "confirming" });
    const result = await confirmImportAction(state.content);

    if (!result.ok) {
      setState({ step: "preview-error", error: result.error });
      return;
    }
    setState({ step: "done", result: result.result });
  }

  function handleReset() {
    setState({ step: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  const disabled = state.step === "previewing" || state.step === "confirming";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-xs flex-col gap-1.5">
        <Label htmlFor="csv-file">Archivo CSV</Label>
        <Input
          id="csv-file"
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>

      {state.step === "previewing" && (
        <p className="text-sm text-muted-foreground">Leyendo archivo…</p>
      )}

      {state.step === "preview-error" && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      {state.step === "preview-ready" && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p>
              Se crearán: <strong>{state.preview.toCreate}</strong>
            </p>
            <p>
              Se actualizarán: <strong>{state.preview.toUpdate}</strong>
            </p>
            <p>
              Se desactivarán: <strong>{state.preview.toDeactivate}</strong>
            </p>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleConfirm}>Confirmar importación</Button>
              <Button variant="outline" onClick={handleReset}>
                Elegir otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.step === "confirming" && (
        <p className="text-sm text-muted-foreground">Importando…</p>
      )}

      {state.step === "done" && (
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Importación completa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <p>
              Creados: <strong>{state.result.created}</strong>
            </p>
            <p>
              Actualizados: <strong>{state.result.updated}</strong>
            </p>
            <p>
              Desactivados: <strong>{state.result.deactivated}</strong>
            </p>
            <div className="flex gap-2 pt-2">
              <Button nativeButton={false} render={<Link href="/">Volver al dashboard</Link>} />
              <Button variant="outline" onClick={handleReset}>
                Importar otro archivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
