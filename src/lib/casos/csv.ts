import { parse } from "csv-parse/sync";
import { fixMojibake } from "./encoding";
import { parseFechaHora, parseMontoClp } from "./parsers";
import type { CasoImportRow } from "./types";

const orNull = (value: string): string | null => (value === "" ? null : value);

const EXPECTED_HEADERS = [
  "Caso: Número del caso",
  "Caso: RUT (Cliente)",
  "Caso: Nombre del contacto",
  "Estado Acción Legal",
  "Caso: Sub Status",
  "Caso: Fecha Envío Fiscalía",
  "Fecha Presentación",
  "Año Presentación",
  "Rol",
  "Fecha Resolución del Tribunal",
  "Fecha Notificación Resolución Tribunal",
  "Resolución del Tribunal",
  "Número del Tribunal",
  "Tribunal",
  "Caso: Localidad / Comuna / Región",
  "Caso: Propietario del caso",
  "Caso: Monto Total Suspendido",
  "Acción Legal: Última modificación por",
  "Abogado Asignado",
  "Acción Legal: Fecha de creación",
  "Caso: Tipo",
] as const;

function buildHeaderIndex(headerRow: string[]): Map<string, number> {
  const index = new Map(headerRow.map((header, i) => [header.trim(), i]));

  const faltantes = EXPECTED_HEADERS.filter((header) => !index.has(header));
  if (faltantes.length > 0) {
    throw new Error(
      `El CSV no tiene las cabeceras esperadas: ${faltantes.join(", ")}`,
    );
  }

  return index;
}

function toCasoImportRow(
  fields: string[],
  headerIndex: Map<string, number>,
): CasoImportRow {
  const col = (header: (typeof EXPECTED_HEADERS)[number]) =>
    fields[headerIndex.get(header)!] ?? "";

  return {
    ot: col("Caso: Número del caso"),
    rut: orNull(col("Caso: RUT (Cliente)")),
    nombreContacto: orNull(col("Caso: Nombre del contacto")),
    estadoAccionLegal: orNull(col("Estado Acción Legal")),
    subStatus: orNull(col("Caso: Sub Status")),
    fechaEnvioFiscalia: parseFechaHora(col("Caso: Fecha Envío Fiscalía")),
    fechaPresentacion: parseFechaHora(col("Fecha Presentación")),
    anioPresentacion: orNull(col("Año Presentación")),
    rol: orNull(col("Rol")),
    fechaResolucionTribunal: parseFechaHora(col("Fecha Resolución del Tribunal")),
    fechaNotificacionResolucionTribunal: parseFechaHora(
      col("Fecha Notificación Resolución Tribunal"),
    ),
    resolucionTribunal: orNull(col("Resolución del Tribunal")),
    numeroTribunal: orNull(col("Número del Tribunal")),
    tribunal: orNull(col("Tribunal")),
    localidadComunaRegion: orNull(col("Caso: Localidad / Comuna / Región")),
    propietarioCaso: orNull(col("Caso: Propietario del caso")),
    montoTotalSuspendidoClp: parseMontoClp(col("Caso: Monto Total Suspendido")),
    ultimaModificacionPor: orNull(col("Acción Legal: Última modificación por")),
    abogadoAsignado: orNull(col("Abogado Asignado")),
    fechaCreacionAccionLegal: parseFechaHora(col("Acción Legal: Fecha de creación")),
    tipoCaso: orNull(col("Caso: Tipo")),
  };
}

export function parseCasosCsv(content: string): CasoImportRow[] {
  const clean = fixMojibake(content);

  const [headerRow, ...records]: string[][] = parse(clean);
  const headerIndex = buildHeaderIndex(headerRow);

  const byOt = new Map<string, CasoImportRow>();
  for (const fields of records) {
    byOt.set(fields[headerIndex.get("Caso: Número del caso")!], toCasoImportRow(fields, headerIndex));
  }

  return [...byOt.values()];
}
