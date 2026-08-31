import { describe, expect, it } from "vitest";
import { parseDenunciasCsv } from "./denuncias-fiscalia";

const HEADER_ORDER = [
  "Case",
  "Caso fiscalía: Número del caso",
  "Caso fiscalía: Nombre / Razón social",
  "Caso fiscalía: Fecha/Hora de apertura",
  "Caso fiscalía: Fecha Envío Fiscalía",
  "Documento",
  "Estado",
  "Fecha recepcion",
  "Caso fiscalía: Dolo",
  "Caso fiscalía: Localidad / Comuna / Región",
  "CaseDocument: Nombre del propietario",
  "Caso fiscalía: Sub Status",
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

describe("parseDenunciasCsv", () => {
  it("parsea solo las filas con Documento = Denuncia", () => {
    const csv = buildCsv([
      {
        Case: "UR-1",
        "Caso fiscalía: Número del caso": "111",
        Documento: "Denuncia",
        Estado: "Recibida",
        "Fecha recepcion": "10-02-2026",
      },
      {
        Case: "UR-2",
        "Caso fiscalía: Número del caso": "222",
        Documento: "Otro Documento",
        Estado: "Recibida",
        "Fecha recepcion": "11-02-2026",
      },
    ]);

    const rows = parseDenunciasCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      ot: "111",
      otUr: "UR-1",
      estadoFiscalia: "Recibida",
    });
    expect(rows[0].fechaRecepcion?.toISOString()).toBe(
      new Date(2026, 1, 10).toISOString(),
    );
  });

  it("si la OT se repite dentro de las filas filtradas, se queda con la última", () => {
    const csv = buildCsv([
      {
        Case: "UR-1",
        "Caso fiscalía: Número del caso": "111",
        Documento: "Denuncia",
        Estado: "Recibida",
        "Fecha recepcion": "10-02-2026",
      },
      {
        Case: "UR-2",
        "Caso fiscalía: Número del caso": "111",
        Documento: "Denuncia",
        Estado: "En revisión",
        "Fecha recepcion": "15-02-2026",
      },
    ]);

    const rows = parseDenunciasCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ ot: "111", otUr: "UR-2", estadoFiscalia: "En revisión" });
  });

  it("campos vacíos se guardan como null", () => {
    const csv = buildCsv([
      {
        Case: "",
        "Caso fiscalía: Número del caso": "111",
        Documento: "Denuncia",
        Estado: "",
        "Fecha recepcion": "",
      },
    ]);

    const [row] = parseDenunciasCsv(csv);

    expect(row).toMatchObject({ ot: "111", otUr: null, estadoFiscalia: null, fechaRecepcion: null });
  });

  it("lanza un error claro si falta una cabecera usada", () => {
    const headersSinEstado = HEADER_ORDER.filter((h) => h !== "Estado");
    const csv = buildCsv(
      [{ "Caso fiscalía: Número del caso": "111", Documento: "Denuncia" }],
      headersSinEstado,
    );

    expect(() => parseDenunciasCsv(csv)).toThrow(/Estado/);
  });
});
