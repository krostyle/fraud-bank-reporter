import { describe, expect, it } from "vitest";
import { parseCasosCsv } from "./csv";

const HEADER =
  '"Caso: Número del caso","Caso: RUT (Cliente)","Caso: Nombre del contacto","Caso: Sub Status","Caso: Fecha Envío Fiscalía","Fecha Presentación","Año Presentación","Rol","Fecha Resolución del Tribunal","Fecha Notificación Resolución Tribunal","Resolución del Tribunal","Número del Tribunal","Tribunal","Caso: Localidad / Comuna / Región","Caso: Propietario del caso","Caso: Monto Total Reclamado UF","Acción Legal: Última modificación por","Estado Acción Legal"';

function row(fields: string[]): string {
  return fields.map((f) => `"${f}"`).join(",");
}

describe("parseCasosCsv", () => {
  it("parsea filas, repara mojibake, convierte fechas/montos y respeta vacíos", () => {
    const nombreCorrecto = "PEDRO NÚÑEZ";
    const nombreMojibake = Buffer.from(nombreCorrecto, "utf8").toString(
      "latin1",
    );

    const csv = [
      HEADER,
      row([
        "111",
        "12345678-9",
        nombreMojibake,
        "Pendiente",
        "27-01-2026, 13:23",
        "30-01-2026",
        "2026",
        "12884",
        "",
        "",
        "",
        "",
        "",
        "REGION METROPOLITANA,RECOLETA,",
        "Juan Perez",
        "17,84717275",
        "Juan Perez",
        "Pendiente",
      ]),
    ].join("\n");

    const [caso] = parseCasosCsv(csv);

    expect(caso).toMatchObject({
      ot: "111",
      rut: "12345678-9",
      nombreContacto: nombreCorrecto,
      subStatus: "Pendiente",
      anioPresentacion: "2026",
      rol: "12884",
      fechaResolucionTribunal: null,
      localidadComunaRegion: "REGION METROPOLITANA,RECOLETA,",
      propietarioCaso: "Juan Perez",
      montoTotalReclamadoUf: 17.84717275,
      ultimaModificacionPor: "Juan Perez",
      estadoAccionLegal: "Pendiente",
    });
    expect(caso.fechaEnvioFiscalia?.toISOString()).toBe(
      new Date(2026, 0, 27, 13, 23).toISOString(),
    );
    expect(caso.fechaPresentacion?.toISOString()).toBe(
      new Date(2026, 0, 30).toISOString(),
    );
  });

  it("si una OT se repite en el archivo, se queda con la última fila", () => {
    const baseRow = [
      "111",
      "",
      "",
      "Pendiente",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Pendiente",
    ];
    const updatedRow = [...baseRow];
    updatedRow[17] = "Terminada";

    const csv = [HEADER, row(baseRow), row(updatedRow)].join("\n");

    const rows = parseCasosCsv(csv);

    expect(rows).toHaveLength(1);
    expect(rows[0].estadoAccionLegal).toBe("Terminada");
  });

  it("filas con distinta OT se mantienen todas", () => {
    const rowFor = (ot: string) => {
      const fields = new Array(18).fill("");
      fields[0] = ot;
      return row(fields);
    };

    const csv = [HEADER, rowFor("111"), rowFor("222")].join("\n");

    const rows = parseCasosCsv(csv);

    expect(rows.map((r) => r.ot)).toEqual(["111", "222"]);
  });
});
