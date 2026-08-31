"use server";

import { del } from "@vercel/blob";
import { readBlob } from "@/lib/casos/blob";
import { importCasosCsv, previewCasosCsv } from "@/lib/casos/import";

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
  } catch (error) {
    console.error("previewImportAction failed:", error);
    return {
      ok: false,
      error: `No se pudo leer el archivo como CSV: ${(error as Error).message}`,
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
  } catch (error) {
    console.error("confirmImportAction failed:", error);
    return {
      ok: false,
      error: `Ocurrió un error al confirmar la importación: ${(error as Error).message}`,
    };
  }
}
