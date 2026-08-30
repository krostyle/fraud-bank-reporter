import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseRegionComuna } from "./ubicacion";

const regionUpsert = vi.fn();
const comunaUpsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    region: {
      upsert: (...args: unknown[]) => regionUpsert(...args),
    },
    comuna: {
      upsert: (...args: unknown[]) => comunaUpsert(...args),
    },
  },
}));

const { resolveUbicacion } = await import("./ubicacion");

describe("parseRegionComuna", () => {
  it("separa región, comuna y descarta la localidad", () => {
    expect(parseRegionComuna("REGION METROPOLITANA,RECOLETA,")).toEqual({
      region: "REGION METROPOLITANA",
      comuna: "RECOLETA",
    });
  });

  it("funciona cuando la localidad viene con un valor", () => {
    expect(
      parseRegionComuna("QUINTA REGION,VINA DEL MAR,NUEVA AURORA"),
    ).toEqual({
      region: "QUINTA REGION",
      comuna: "VINA DEL MAR",
    });
  });

  it("recorta espacios alrededor de cada valor", () => {
    expect(parseRegionComuna(" REGION METROPOLITANA , RECOLETA ")).toEqual({
      region: "REGION METROPOLITANA",
      comuna: "RECOLETA",
    });
  });

  it("devuelve region y comuna null si el valor es null", () => {
    expect(parseRegionComuna(null)).toEqual({ region: null, comuna: null });
  });

  it("devuelve region y comuna null si el valor es vacío", () => {
    expect(parseRegionComuna("")).toEqual({ region: null, comuna: null });
  });

  it("devuelve comuna null si solo viene la región", () => {
    expect(parseRegionComuna("REGION METROPOLITANA")).toEqual({
      region: "REGION METROPOLITANA",
      comuna: null,
    });
  });
});

describe("resolveUbicacion", () => {
  beforeEach(() => {
    regionUpsert.mockReset();
    comunaUpsert.mockReset();
  });

  it("crea/reutiliza la región y la comuna, y devuelve sus ids", async () => {
    regionUpsert.mockResolvedValue({ id: "region-1", nombre: "REGION METROPOLITANA" });
    comunaUpsert.mockResolvedValue({ id: "comuna-1", nombre: "RECOLETA", regionId: "region-1" });

    const result = await resolveUbicacion("REGION METROPOLITANA,RECOLETA,");

    expect(regionUpsert).toHaveBeenCalledWith({
      where: { nombre: "REGION METROPOLITANA" },
      create: { nombre: "REGION METROPOLITANA" },
      update: {},
    });
    expect(comunaUpsert).toHaveBeenCalledWith({
      where: { regionId_nombre: { regionId: "region-1", nombre: "RECOLETA" } },
      create: { nombre: "RECOLETA", regionId: "region-1" },
      update: {},
    });
    expect(result).toEqual({ regionId: "region-1", comunaId: "comuna-1" });
  });

  it("no toca la base y devuelve nulls si falta la región o la comuna", async () => {
    const result = await resolveUbicacion("");

    expect(regionUpsert).not.toHaveBeenCalled();
    expect(comunaUpsert).not.toHaveBeenCalled();
    expect(result).toEqual({ regionId: null, comunaId: null });
  });
});
