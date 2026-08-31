import { describe, expect, it } from "vitest";
import { parseCasosCsv } from "./csv";

const HEADER_ORDER = [
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
];

function csvLine(values: string[]): string {
  return values.map((v) => `"${v}"`).join(",");
}

function buildCsv(
  rows: Record<string, string>[],
  headers: string[] = HEADER_ORDER,
): string {
  const lines = [
    csvLine(headers),
    ...rows.map((data) => csvLine(headers.map((h) => data[h] ?? ""))),
  ];
  return lines.join("\n");
}

describe("parseCasosCsv", () => {
  it("parsea filas por nombre de cabecera, repara mojibake, convierte fechas/montos y respeta vacíos", () => {
    const nombreCorrecto = "PEDRO NÚÑEZ";

    const csvCorrecto = buildCsv([
      {
        "Caso: Número del caso": "111",
        "Caso: RUT (Cliente)": "12345678-9",
        "Caso: Nombre del contacto": nombreCorrecto,
        "Estado Acción Legal": "Pendiente",
        "Caso: Sub Status": "Anulado",
        "Caso: Fecha Envío Fiscalía": "27-01-2026, 13:23",
        "Fecha Presentación": "30-01-2026",
        "Año Presentación": "2026",
        Rol: "12884",
        "Caso: Localidad / Comuna / Región": "REGION METROPOLITANA,RECOLETA,",
        "Caso: Propietario del caso": "Juan Perez",
        "Caso: Monto Total Suspendido": "1.234.567",
        "Acción Legal: Última modificación por": "Juan Perez",
        "Abogado Asignado": "María Soto",
        "Acción Legal: Fecha de creación": "15-01-2026",
        "Caso: Tipo": "Demanda",
      },
    ]);
    // Simula un archivo completo con mojibake por doble codificación (spec 001) —
    // afecta todo el archivo, cabeceras incluidas, no un campo suelto.
    const csv = Buffer.from(csvCorrecto, "utf8").toString("latin1");

    const [caso] = parseCasosCsv(csv);

    expect(caso).toMatchObject({
      ot: "111",
      rut: "12345678-9",
      nombreContacto: nombreCorrecto,
      // Estado Acción Legal y Sub Status no deben cruzarse pese al reordenamiento de columnas.
      estadoAccionLegal: "Pendiente",
      subStatus: "Anulado",
      anioPresentacion: "2026",
      rol: "12884",
      fechaResolucionTribunal: null,
      localidadComunaRegion: "REGION METROPOLITANA,RECOLETA,",
      propietarioCaso: "Juan Perez",
      montoTotalSuspendidoClp: 1234567,
      ultimaModificacionPor: "Juan Perez",
      abogadoAsignado: "María Soto",
      tipoCaso: "Demanda",
    });
    expect(caso.fechaEnvioFiscalia?.toISOString()).toBe(
      new Date(2026, 0, 27, 13, 23).toISOString(),
    );
    expect(caso.fechaPresentacion?.toISOString()).toBe(
      new Date(2026, 0, 30).toISOString(),
    );
    expect(caso.fechaCreacionAccionLegal?.toISOString()).toBe(
      new Date(2026, 0, 15).toISOString(),
    );
  });

  it("si una OT se repite en el archivo, se queda con la última fila", () => {
    const csv = buildCsv([
      { "Caso: Número del caso": "111", "Estado Acción Legal": "Pendiente" },
      { "Caso: Número del caso": "111", "Estado Acción Legal": "Terminada" },
    ]);

    const rows = parseCasosCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0].estadoAccionLegal).toBe("Terminada");
  });

  it("filas con distinta OT se mantienen todas", () => {
    const csv = buildCsv([
      { "Caso: Número del caso": "111" },
      { "Caso: Número del caso": "222" },
    ]);

    const rows = parseCasosCsv(csv);

    expect(rows.map((r) => r.ot)).toEqual(["111", "222"]);
  });

  it("lanza un error claro si falta una cabecera esperada", () => {
    const headersSinAbogado = HEADER_ORDER.filter(
      (h) => h !== "Abogado Asignado",
    );
    const csv = buildCsv(
      [{ "Caso: Número del caso": "111" }],
      headersSinAbogado,
    );

    expect(() => parseCasosCsv(csv)).toThrow(/Abogado Asignado/);
  });
});
