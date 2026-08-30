import { beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.fn();
const upsert = vi.fn();
const updateMany = vi.fn();
const count = vi.fn();
const regionFindMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    caso: {
      findMany: (...args: unknown[]) => findMany(...args),
      upsert: (...args: unknown[]) => upsert(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
      count: (...args: unknown[]) => count(...args),
    },
    region: {
      findMany: (...args: unknown[]) => regionFindMany(...args),
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

const CATALOGO_PRUEBA = [
  {
    id: "region-rm",
    nombre: "Metropolitana",
    aliases: ["RM", "REGION METROPOLITANA"],
    comunas: [{ id: "comuna-recoleta", nombre: "Recoleta" }],
  },
  {
    id: "region-valpo",
    nombre: "Valparaíso",
    aliases: ["QUINTA REGION"],
    comunas: [{ id: "comuna-vina", nombre: "Viña del Mar" }],
  },
];

beforeEach(() => {
  findMany.mockReset();
  upsert.mockReset();
  updateMany.mockReset();
  count.mockReset();
  regionFindMany.mockReset();
  regionFindMany.mockResolvedValue(CATALOGO_PRUEBA);
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
          regionId: "region-rm",
          comunaId: "comuna-recoleta",
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
          regionId: "region-valpo",
          comunaId: "comuna-vina",
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
    expect(result).toEqual({ toCreate: 1, toUpdate: 1, toDeactivate: 3 });
  });
});
