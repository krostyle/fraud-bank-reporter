import { parseCasosCsv } from "./csv";
import { previewSyncCasos, syncCasos } from "./sync";

export async function importCasosCsv(content: string) {
  const rows = parseCasosCsv(content);
  return syncCasos(rows);
}

export async function previewCasosCsv(content: string) {
  const rows = parseCasosCsv(content);
  return previewSyncCasos(rows);
}
