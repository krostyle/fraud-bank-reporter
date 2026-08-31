import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DenunciaRow } from "./denuncias-fiscalia";

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

const { syncDenuncias, previewSyncDenuncias } = await import("./denuncias-sync");

function makeRow(ot: string, overrides: Partial<DenunciaRow> = {}): DenunciaRow {
  return {
    ot,
    otUr: null,
    fechaRecepcion: null,
    estadoFiscalia: null,
    ...overrides,
  };
}

beforeEach(() => {
  findMany.mockReset();
  update.mockReset();
});

describe("syncDenuncias", () => {
  it("actualiza solo los Casos cuya OT ya existe, y cuenta los que no matchean", async () => {
    findMany.mockResolvedValue([{ ot: "111" }]);

    const rows = [
      makeRow("111", { otUr: "UR-1", estadoFiscalia: "Recibida" }),
      makeRow("222", { otUr: "UR-2", estadoFiscalia: "Recibida" }),
    ];
    const result = await syncDenuncias(rows);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith({
      where: { ot: "111" },
      data: { otUr: "UR-1", fechaRecepcion: null, estadoFiscalia: "Recibida" },
    });
    expect(result).toEqual({ actualizados: 1, sinMatch: 1 });
  });

  it("no toca el campo activo ni crea Casos nuevos", async () => {
    findMany.mockResolvedValue([]);

    const result = await syncDenuncias([makeRow("999")]);

    expect(update).not.toHaveBeenCalled();
    expect(result).toEqual({ actualizados: 0, sinMatch: 1 });
  });
});

describe("previewSyncDenuncias", () => {
  it("calcula actualizados/sin-match sin escribir en la base", async () => {
    findMany.mockResolvedValue([{ ot: "111" }]);

    const rows = [makeRow("111"), makeRow("222")];
    const result = await previewSyncDenuncias(rows);

    expect(update).not.toHaveBeenCalled();
    expect(result).toEqual({ actualizados: 1, sinMatch: 1 });
  });
});
