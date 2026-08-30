import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CasoImportRow } from "./types";

const findMany = vi.fn();
const upsert = vi.fn();
const updateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    caso: {
      findMany: (...args: unknown[]) => findMany(...args),
      upsert: (...args: unknown[]) => upsert(...args),
      updateMany: (...args: unknown[]) => updateMany(...args),
    },
  },
}));

const { syncCasos } = await import("./sync");

function makeRow(ot: string): CasoImportRow {
  return {
    ot,
    rut: null,
    nombreContacto: null,
    subStatus: null,
    fechaEnvioFiscalia: null,
    fechaPresentacion: null,
    anioPresentacion: null,
    rol: null,
    fechaResolucionTribunal: null,
    fechaNotificacionResolucionTribunal: null,
    resolucionTribunal: null,
    numeroTribunal: null,
    tribunal: null,
    localidadComunaRegion: null,
    propietarioCaso: null,
    montoTotalReclamadoUf: null,
    ultimaModificacionPor: null,
    estadoAccionLegal: null,
  };
}

beforeEach(() => {
  findMany.mockReset();
  upsert.mockReset();
  updateMany.mockReset();
  updateMany.mockResolvedValue({ count: 0 });
});

describe("syncCasos", () => {
  it("hace upsert de cada fila con activo=true y marca inactivas las OT ausentes", async () => {
    findMany.mockResolvedValue([{ ot: "111" }]);
    updateMany.mockResolvedValue({ count: 2 });

    const rows = [makeRow("111"), makeRow("222")];
    const result = await syncCasos(rows);

    expect(upsert).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ot: "111" },
        create: expect.objectContaining({ ot: "111", activo: true }),
        update: expect.objectContaining({ activo: true }),
      }),
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ot: "222" },
        create: expect.objectContaining({ ot: "222", activo: true }),
        update: expect.objectContaining({ activo: true }),
      }),
    );

    expect(updateMany).toHaveBeenCalledWith({
      where: { ot: { notIn: ["111", "222"] }, activo: true },
      data: { activo: false },
    });

    expect(result).toEqual({ created: 1, updated: 1, deactivated: 2 });
  });

  it("con un archivo vacío, no hace upsert y desactiva todo lo que siga activo", async () => {
    findMany.mockResolvedValue([]);
    updateMany.mockResolvedValue({ count: 5 });

    const result = await syncCasos([]);

    expect(upsert).not.toHaveBeenCalled();
    expect(updateMany).toHaveBeenCalledWith({
      where: { ot: { notIn: [] }, activo: true },
      data: { activo: false },
    });
    expect(result).toEqual({ created: 0, updated: 0, deactivated: 5 });
  });
});
