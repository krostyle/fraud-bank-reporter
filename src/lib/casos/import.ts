import { parseCasosCsv } from "./csv";
import { syncCasos } from "./sync";

export async function importCasosCsv(content: string) {
  const rows = parseCasosCsv(content);
  return syncCasos(rows);
}
