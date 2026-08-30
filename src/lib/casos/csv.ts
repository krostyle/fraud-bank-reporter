import { parse } from "csv-parse/sync";
import { fixMojibake } from "./encoding";
import { parseFechaHora, parseMontoUf } from "./parsers";
import type { CasoImportRow } from "./types";

const orNull = (value: string): string | null => (value === "" ? null : value);

function toCasoImportRow(fields: string[]): CasoImportRow {
  return {
    ot: fields[0],
    rut: orNull(fields[1]),
    nombreContacto: orNull(fields[2]),
    subStatus: orNull(fields[3]),
    fechaEnvioFiscalia: parseFechaHora(fields[4]),
    fechaPresentacion: parseFechaHora(fields[5]),
    anioPresentacion: orNull(fields[6]),
    rol: orNull(fields[7]),
    fechaResolucionTribunal: parseFechaHora(fields[8]),
    fechaNotificacionResolucionTribunal: parseFechaHora(fields[9]),
    resolucionTribunal: orNull(fields[10]),
    numeroTribunal: orNull(fields[11]),
    tribunal: orNull(fields[12]),
    localidadComunaRegion: orNull(fields[13]),
    propietarioCaso: orNull(fields[14]),
    montoTotalReclamadoUf: parseMontoUf(fields[15]),
    ultimaModificacionPor: orNull(fields[16]),
    estadoAccionLegal: orNull(fields[17]),
  };
}

export function parseCasosCsv(content: string): CasoImportRow[] {
  const clean = fixMojibake(content);

  const records: string[][] = parse(clean, {
    from_line: 2,
  });

  const byOt = new Map<string, CasoImportRow>();
  for (const fields of records) {
    byOt.set(fields[0], toCasoImportRow(fields));
  }

  return [...byOt.values()];
}
