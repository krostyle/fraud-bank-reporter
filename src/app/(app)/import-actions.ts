"use server";

import { del } from "@vercel/blob";
import { importCasosCsv, previewCasosCsv } from "@/lib/casos/import";

async function readBlob(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error("No se pudo leer el archivo subido.");
  }
  return response.text();
}

export type ImportPreviewResult =
  | {
      ok: true;
      preview: { toCreate: number; toUpdate: number; toDeactivate: number };
    }
  | { ok: false; error: string };

export async function previewImportAction(
  blobUrl: string,
): Promise<ImportPreviewResult> {
  try {
    const content = await readBlob(blobUrl);
    const preview = await previewCasosCsv(content);
    return { ok: true, preview };
  } catch {
    return {
      ok: false,
      error: "No se pudo leer el archivo como CSV. Verifica que el formato sea correcto.",
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
  blobUrl: string,
): Promise<ImportConfirmResult> {
  try {
    const content = await readBlob(blobUrl);
    const result = await importCasosCsv(content);
    await del(blobUrl).catch(() => {});
    return { ok: true, result };
  } catch {
    return {
      ok: false,
      error: "Ocurrió un error al confirmar la importación.",
    };
  }
}
