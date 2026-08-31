import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const update = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    caso: {
      findMany: (...args: unknown[]) => findMany(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

const { importDenunciasCsv, previewDenunciasCsv } = await import("./denuncias-import");

const HEADER =
  '"Case","Caso fiscalía: Número del caso","Caso fiscalía: Nombre / Razón social","Caso fiscalía: Fecha/Hora de apertura","Caso fiscalía: Fecha Envío Fiscalía","Documento","Estado","Fecha recepcion","Caso fiscalía: Dolo","Caso fiscalía: Localidad / Comuna / Región","CaseDocument: Nombre del propietario","Caso fiscalía: Sub Status"';

const SAMPLE_CSV = [
  HEADER,
  '"UR-1001","87837653","LUIS RICARDO FERNANDEZ PIMENTEL","01-01-2026, 09:00","27-01-2026, 13:23","Denuncia","Recibida","10-02-2026","No","REGION METROPOLITANA,RECOLETA,","Manuel Searle Risopatrón",""',
  '"UR-1002","999999999","OTRO","01-01-2026, 09:00","27-01-2026, 13:23","Comprobante","Recibida","10-02-2026","No","","",""',
].join("\n");

beforeEach(() => {
  findMany.mockReset();
  update.mockReset();
});

describe("importDenunciasCsv", () => {
  it("parsea la muestra y sincroniza solo la fila con Documento=Denuncia contra la base", async () => {
    findMany.mockResolvedValue([{ ot: "87837653" }]);

    const result = await importDenunciasCsv(SAMPLE_CSV);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { ot: "87837653" },
      data: {
        otUr: "UR-1001",
        fechaRecepcion: new Date(2026, 1, 10),
        estadoFiscalia: "Recibida",
      },
    });
    expect(result).toEqual({ actualizados: 1, sinMatch: 0 });
  });
});

describe("previewDenunciasCsv", () => {
  it("calcula el resultado esperado sin escribir en la base", async () => {
    findMany.mockResolvedValue([]);

    const result = await previewDenunciasCsv(SAMPLE_CSV);

    expect(update).not.toHaveBeenCalled();
    expect(result).toEqual({ actualizados: 0, sinMatch: 1 });
  });
});
