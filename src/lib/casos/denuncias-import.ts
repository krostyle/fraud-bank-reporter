import { parseDenunciasCsv } from "./denuncias-fiscalia";
import { previewSyncDenuncias, syncDenuncias } from "./denuncias-sync";

export async function importDenunciasCsv(content: string) {
  const rows = parseDenunciasCsv(content);
  return syncDenuncias(rows);
}

export async function previewDenunciasCsv(content: string) {
  const rows = parseDenunciasCsv(content);
  return previewSyncDenuncias(rows);
}
