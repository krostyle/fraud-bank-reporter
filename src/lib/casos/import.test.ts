import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const upsert = vi.fn();
const updateMany = vi.fn();
const count = vi.fn();
const regionUpsert = vi.fn();
const comunaUpsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    caso: {
      findMany: (...args: unknown[]) => findMany(...args),
      upsert: (...args: unknown[]) => upsert(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
      count: (...args: unknown[]) => count(...args),
    },
    region: {
      upsert: (...args: unknown[]) => regionUpsert(...args),
    },
    comuna: {
      upsert: (...args: unknown[]) => comunaUpsert(...args),
    },
  },
}));

const { importCasosCsv, previewCasosCsv } = await import("./import");

const HEADER =
  '"Caso: Número del caso","Caso: RUT (Cliente)","Caso: Nombre del contacto","Caso: Sub Status","Caso: Fecha Envío Fiscalía","Fecha Presentación","Año Presentación","Rol","Fecha Resolución del Tribunal","Fecha Notificación Resolución Tribunal","Resolución del Tribunal","Número del Tribunal","Tribunal","Caso: Localidad / Comuna / Región","Caso: Propietario del caso","Caso: Monto Total Reclamado UF","Acción Legal: Última modificación por","Estado Acción Legal"';

const SAMPLE_CSV = [
  HEADER,
  '"87837653","91518937","LUIS RICARDO FERNANDEZ PIMENTEL","En Espera de Fecha Final de Resolución","27-01-2026, 13:23","30-01-2026","2026","12884","12-08-2026","13-08-2026","Acoge","1","Primer Juzgado de Policía Local Recoleta","REGION METROPOLITANA,RECOLETA,","Manuel José Searle Risopatrón","54,11883737","Manuel Searle Risopatrón",""',
  '"102812617","172762816","VICTOR ALFONSO TRIGO ARAYA","Anulado","07-07-2026, 14:15","","","","","","","","","QUINTA REGION,VINA DEL MAR,NUEVA AURORA","JAIRO GABRIEL BECERRA BRIONES","131,04160506","Eduvis Jimenez Mejias","Pendiente"',
].join("\n");

beforeEach(() => {
  findMany.mockReset();
  upsert.mockReset();
  updateMany.mockReset();
  count.mockReset();
  regionUpsert.mockReset();
  comunaUpsert.mockReset();
  regionUpsert.mockImplementation(({ create }) =>
    Promise.resolve({ id: `region-${create.nombre}`, nombre: create.nombre }),
  );
  comunaUpsert.mockImplementation(({ create }) =>
    Promise.resolve({
      id: `comuna-${create.nombre}`,
      nombre: create.nombre,
      regionId: create.regionId,
    }),
  );
});

describe("importCasosCsv", () => {
  it("parsea la muestra real y sincroniza contra la base", async () => {
    findMany.mockResolvedValue([]);
    updateMany.mockResolvedValue({ count: 0 });

    const result = await importCasosCsv(SAMPLE_CSV);

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ot: "87837653" },
        create: expect.objectContaining({
          ot: "87837653",
          nombreContacto: "LUIS RICARDO FERNANDEZ PIMENTEL",
          montoTotalReclamadoUf: 54.11883737,
          regionId: "region-REGION METROPOLITANA",
          comunaId: "comuna-RECOLETA",
          activo: true,
        }),
      }),
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ot: "102812617" },
        create: expect.objectContaining({
          ot: "102812617",
          subStatus: "Anulado",
          fechaPresentacion: null,
          regionId: "region-QUINTA REGION",
          comunaId: "comuna-VINA DEL MAR",
          activo: true,
        }),
      }),
    );
    expect(updateMany).toHaveBeenCalledWith({
      where: { ot: { notIn: ["87837653", "102812617"] }, activo: true },
      data: { activo: false },
    });
    expect(result).toEqual({ created: 2, updated: 0, deactivated: 0 });
  });
});

describe("previewCasosCsv", () => {
  it("calcula el resultado esperado sin escribir en la base", async () => {
    findMany.mockResolvedValue([{ ot: "87837653" }]);
    count.mockResolvedValue(3);

    const result = await previewCasosCsv(SAMPLE_CSV);

    expect(upsert).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
    expect(regionUpsert).not.toHaveBeenCalled();
    expect(comunaUpsert).not.toHaveBeenCalled();
    expect(result).toEqual({ toCreate: 1, toUpdate: 1, toDeactivate: 3 });
  });
});
