import { parse } from "csv-parse/sync";
import { fixMojibake } from "./encoding";
import { parseFechaHora } from "./parsers";

const orNull = (value: string): string | null => (value === "" ? null : value);

export type DenunciaRow = {
  ot: string;
  otUr: string | null;
  fechaRecepcion: Date | null;
  estadoFiscalia: string | null;
};

const USED_HEADERS = [
  "Case",
  "Caso fiscalía: Número del caso",
  "Documento",
  "Estado",
  "Fecha recepcion",
] as const;

const DOCUMENTO_DENUNCIA = "Denuncia";

function buildHeaderIndex(headerRow: string[]): Map<string, number> {
  const index = new Map(headerRow.map((header, i) => [header.trim(), i]));

  const faltantes = USED_HEADERS.filter((header) => !index.has(header));
  if (faltantes.length > 0) {
    throw new Error(
      `El CSV de Denuncias no tiene las cabeceras esperadas: ${faltantes.join(", ")}`,
    );
  }

  return index;
}

export function parseDenunciasCsv(content: string): DenunciaRow[] {
  const clean = fixMojibake(content);

  const [headerRow, ...records]: string[][] = parse(clean);
  const headerIndex = buildHeaderIndex(headerRow);

  const col = (fields: string[], header: (typeof USED_HEADERS)[number]) =>
    fields[headerIndex.get(header)!] ?? "";

  const byOt = new Map<string, DenunciaRow>();
  for (const fields of records) {
    if (col(fields, "Documento") !== DOCUMENTO_DENUNCIA) continue;

    const ot = col(fields, "Caso fiscalía: Número del caso");
    byOt.set(ot, {
      ot,
      otUr: orNull(col(fields, "Case")),
      fechaRecepcion: parseFechaHora(col(fields, "Fecha recepcion")),
      estadoFiscalia: orNull(col(fields, "Estado")),
    });
  }

  return [...byOt.values()];
}
