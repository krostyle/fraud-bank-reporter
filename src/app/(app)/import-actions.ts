"use server";

import { importCasosCsv, previewCasosCsv } from "@/lib/casos/import";

export type ImportPreviewResult =
  | {
      ok: true;
      preview: { toCreate: number; toUpdate: number; toDeactivate: number };
      content: string;
    }
  | { ok: false; error: string };

export async function previewImportAction(
  formData: FormData,
): Promise<ImportPreviewResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "No se seleccionó ningún archivo." };
  }

  const content = await file.text();

  try {
    const preview = await previewCasosCsv(content);
    return { ok: true, preview, content };
  } catch {
    return {
      ok: false,
      error: "No se pudo leer el archivo como CSV. Verificá que el formato sea correcto.",
    };
  }
}

export type ImportConfirmResult =
  | {
      ok: true;
      result: { created: number; updated: number; deactivated: number };
    }
  | { ok: false; error: string };

export async function confirmImportAction(
  content: string,
): Promise<ImportConfirmResult> {
  try {
    const result = await importCasosCsv(content);
    return { ok: true, result };
  } catch {
    return {
      ok: false,
      error: "Ocurrió un error al confirmar la importación.",
    };
  }
}
