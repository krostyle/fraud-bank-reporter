import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  levenshteinDistance,
  matchUbicacion,
  normalizeUbicacionText,
  parseRegionComuna,
  similarityRatio,
  type UbicacionCatalog,
} from "./ubicacion";

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

describe("normalizeUbicacionText", () => {
  it("pasa a mayúsculas", () => {
    expect(normalizeUbicacionText("recoleta")).toBe("RECOLETA");
  });

  it("saca tildes y la diéresis de la ñ", () => {
    expect(normalizeUbicacionText("Ñuñoa")).toBe("NUNOA");
    expect(normalizeUbicacionText("Valparaíso")).toBe("VALPARAISO");
  });

  it("recorta y colapsa espacios de más", () => {
    expect(normalizeUbicacionText("  Puente   Alto  ")).toBe("PUENTE ALTO");
  });
});

describe("levenshteinDistance", () => {
  it("es 0 para strings iguales", () => {
    expect(levenshteinDistance("RECOLETA", "RECOLETA")).toBe(0);
  });

  it("cuenta la cantidad mínima de ediciones", () => {
    expect(levenshteinDistance("RECOLETA", "RECOLET")).toBe(1);
    expect(levenshteinDistance("GATO", "PATO")).toBe(1);
  });
});

describe("similarityRatio", () => {
  it("es 1 para strings iguales", () => {
    expect(similarityRatio("RECOLETA", "RECOLETA")).toBe(1);
  });

  it("baja a medida que las diferencias aumentan", () => {
    expect(similarityRatio("RECOLETA", "RECOLET")).toBeGreaterThan(0.8);
    expect(similarityRatio("RECOLETA", "XXXXXXXX")).toBeLessThan(0.2);
  });
});

const CATALOGO_PRUEBA: UbicacionCatalog = [
  {
    id: "region-rm",
    nombre: "Metropolitana",
    aliases: ["RM", "REGION METROPOLITANA", "XIII REGION"],
    comunas: [
      { id: "comuna-recoleta", nombre: "Recoleta" },
      { id: "comuna-nunoa", nombre: "Ñuñoa" },
      { id: "comuna-puente-alto", nombre: "Puente Alto" },
    ],
  },
  {
    id: "region-valpo",
    nombre: "Valparaíso",
    aliases: ["V REGION", "QUINTA REGION", "REGION DE VALPARAISO"],
    comunas: [
      { id: "comuna-vina", nombre: "Viña del Mar" },
      { id: "comuna-concon", nombre: "Concón" },
    ],
  },
];

describe("matchUbicacion", () => {
  it("matchea región y comuna por coincidencia exacta (con mayúsculas/tildes distintas)", () => {
    expect(
      matchUbicacion("REGION METROPOLITANA,RECOLETA,", CATALOGO_PRUEBA),
    ).toEqual({ regionId: "region-rm", comunaId: "comuna-recoleta" });
  });

  it("matchea la región por alias (RM, número romano, ordinal en palabras)", () => {
    expect(matchUbicacion("RM,NUÑOA,", CATALOGO_PRUEBA)).toEqual({
      regionId: "region-rm",
      comunaId: "comuna-nunoa",
    });
    expect(
      matchUbicacion("QUINTA REGION,VINA DEL MAR,NUEVA AURORA", CATALOGO_PRUEBA),
    ).toEqual({ regionId: "region-valpo", comunaId: "comuna-vina" });
  });

  it("matchea comuna con mayúsculas/tildes distintas a las oficiales", () => {
    expect(matchUbicacion("rm,ñuñoa,", CATALOGO_PRUEBA)).toEqual({
      regionId: "region-rm",
      comunaId: "comuna-nunoa",
    });
  });

  it("matchea por similitud si hay un error de tipeo chico", () => {
    expect(matchUbicacion("RM,RECOLET,", CATALOGO_PRUEBA)).toEqual({
      regionId: "region-rm",
      comunaId: "comuna-recoleta",
    });
  });

  it("no matchea la comuna si pertenece a otra región (evita ambigüedad cruzada)", () => {
    // "Concón" existe en el catálogo pero bajo Valparaíso, no bajo RM
    expect(matchUbicacion("RM,CONCON,", CATALOGO_PRUEBA)).toEqual({
      regionId: "region-rm",
      comunaId: null,
    });
  });

  it("si el campo de región es en realidad el nombre de una comuna real, infiere la región correspondiente", () => {
    // Anomalía real vista en producción: la fuente pone el nombre de una
    // comuna (ej. "Talcahuano") también en el campo de región.
    expect(matchUbicacion("Puente Alto,Puente Alto,", CATALOGO_PRUEBA)).toEqual({
      regionId: "region-rm",
      comunaId: "comuna-puente-alto",
    });
  });

  it("no matchea nada si el texto no se parece a ninguna región real", () => {
    expect(matchUbicacion("PLANETA MARTE,CRATER,", CATALOGO_PRUEBA)).toEqual({
      regionId: null,
      comunaId: null,
    });
  });

  it("devuelve todo null si falta región o comuna en el texto crudo", () => {
    expect(matchUbicacion("", CATALOGO_PRUEBA)).toEqual({
      regionId: null,
      comunaId: null,
    });
    expect(matchUbicacion(null, CATALOGO_PRUEBA)).toEqual({
      regionId: null,
      comunaId: null,
    });
  });
});

const findMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    region: {
      findMany: (...args: unknown[]) => findMany(...args),
    },
  },
}));

const { resolveUbicacionesBatch } = await import("./ubicacion");

describe("resolveUbicacionesBatch", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("carga el catálogo una sola vez y resuelve cada valor único", async () => {
    findMany.mockResolvedValue([
      {
        id: "region-rm",
        nombre: "Metropolitana",
        aliases: ["RM"],
        comunas: [{ id: "comuna-recoleta", nombre: "Recoleta" }],
      },
    ]);

    const raw = "RM,RECOLETA,";
    const map = await resolveUbicacionesBatch([raw, raw, null]);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(map.get(raw)).toEqual({ regionId: "region-rm", comunaId: "comuna-recoleta" });
  });
});
