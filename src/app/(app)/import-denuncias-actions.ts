"use server";

import { del } from "@vercel/blob";
import { readBlob } from "@/lib/casos/blob";
import { importDenunciasCsv, previewDenunciasCsv } from "@/lib/casos/denuncias-import";

export type ImportDenunciasPreviewResult =
  | { ok: true; preview: { actualizados: number; sinMatch: number } }
  | { ok: false; error: string };

export async function previewImportDenunciasAction(
  blobUrl: string,
): Promise<ImportDenunciasPreviewResult> {
  try {
    const content = await readBlob(blobUrl);
    const preview = await previewDenunciasCsv(content);
    return { ok: true, preview };
  } catch (error) {
    console.error("previewImportDenunciasAction failed:", error);
    return {
      ok: false,
      error: `No se pudo leer el archivo como CSV: ${(error as Error).message}`,
    };
  }
}

export type ImportDenunciasConfirmResult =
  | { ok: true; result: { actualizados: number; sinMatch: number } }
  | { ok: false; error: string };

export async function confirmImportDenunciasAction(
  blobUrl: string,
): Promise<ImportDenunciasConfirmResult> {
  try {
    const content = await readBlob(blobUrl);
    const result = await importDenunciasCsv(content);
    await del(blobUrl).catch(() => {});
    return { ok: true, result };
  } catch (error) {
    console.error("confirmImportDenunciasAction failed:", error);
    return {
      ok: false,
      error: `Ocurrió un error al confirmar la importación: ${(error as Error).message}`,
    };
  }
}
