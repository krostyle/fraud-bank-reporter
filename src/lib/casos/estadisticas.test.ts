import { describe, expect, it } from "vitest";
import {
  agruparPorMes,
  bucketResolucion,
  fechaReferencia,
  filtrarPorPeriodo,
  promedioDiasMp,
  type CasoEstadistica,
} from "./estadisticas";

function makeCaso(overrides: Partial<CasoEstadistica> = {}): CasoEstadistica {
  return {
    ot: "1",
    tipoCaso: null,
    fechaEnvioFiscalia: null,
    fechaPresentacion: null,
    fechaCreacionAccionLegal: null,
    resolucionTribunal: null,
    estadoAccionLegal: null,
    abogadoAsignado: null,
    montoTotalSuspendidoClp: null,
    regionId: null,
    regionNombre: null,
    comunaId: null,
    comunaNombre: null,
    ...overrides,
  };
}

describe("fechaReferencia", () => {
  it("usa Fecha Envío Fiscalía para casos MP", () => {
    const caso = makeCaso({
      tipoCaso: "MP",
      fechaEnvioFiscalia: new Date(2026, 0, 10),
      fechaPresentacion: new Date(2026, 1, 1),
    });
    expect(fechaReferencia(caso)).toEqual(new Date(2026, 0, 10));
  });

  it("usa Fecha Presentación para cualquier otro tipo", () => {
    const caso = makeCaso({
      tipoCaso: "Demanda",
      fechaEnvioFiscalia: new Date(2026, 0, 10),
      fechaPresentacion: new Date(2026, 1, 1),
    });
    expect(fechaReferencia(caso)).toEqual(new Date(2026, 1, 1));
  });

  it("devuelve null si al caso le falta la fecha que le corresponde según su tipo", () => {
    const caso = makeCaso({ tipoCaso: "MP", fechaEnvioFiscalia: null });
    expect(fechaReferencia(caso)).toBeNull();
  });
});

describe("filtrarPorPeriodo", () => {
  const hoy = new Date(2026, 7, 30);
  const casoEsteAnio = makeCaso({
    ot: "este-anio",
    tipoCaso: "Demanda",
    fechaPresentacion: new Date(2026, 0, 15),
  });
  const casoAnioPasado = makeCaso({
    ot: "anio-pasado",
    tipoCaso: "Demanda",
    fechaPresentacion: new Date(2025, 5, 1),
  });
  const casoHace3Anios = makeCaso({
    ot: "hace-3-anios",
    tipoCaso: "Demanda",
    fechaPresentacion: new Date(2023, 0, 1),
  });
  const casoSinFecha = makeCaso({ ot: "sin-fecha", tipoCaso: "Demanda" });

  const casos = [casoEsteAnio, casoAnioPasado, casoHace3Anios, casoSinFecha];

  it("'actual' deja solo los Casos cuya fecha de referencia cae en el año en curso", () => {
    const resultado = filtrarPorPeriodo(casos, "actual", hoy);
    expect(resultado.map((c) => c.ot)).toEqual(["este-anio"]);
  });

  it("'ultimoAnio' deja los Casos del año en curso y el año anterior", () => {
    const resultado = filtrarPorPeriodo(casos, "ultimoAnio", hoy);
    expect(resultado.map((c) => c.ot)).toEqual(["este-anio", "anio-pasado"]);
  });

  it("'historico' no filtra nada, Casos sin fecha incluidos", () => {
    const resultado = filtrarPorPeriodo(casos, "historico", hoy);
    expect(resultado).toHaveLength(4);
  });
});

describe("agruparPorMes", () => {
  it("agrupa por año-mes usando la fecha de referencia de cada caso", () => {
    const casos = [
      makeCaso({ tipoCaso: "Demanda", fechaPresentacion: new Date(2026, 0, 5) }),
      makeCaso({ tipoCaso: "Demanda", fechaPresentacion: new Date(2026, 0, 20) }),
      makeCaso({ tipoCaso: "Demanda", fechaPresentacion: new Date(2026, 1, 1) }),
      makeCaso({ tipoCaso: "Demanda", fechaPresentacion: null }),
    ];

    const resultado = agruparPorMes(casos);

    expect(resultado).toEqual([
      { mes: "2026-01", count: 2 },
      { mes: "2026-02", count: 1 },
    ]);
  });
});

describe("bucketResolucion", () => {
  it("agrupa en Acoge/Rechaza/Otros y separa los sin resolución", () => {
    const casos = [
      makeCaso({ resolucionTribunal: "Acoge" }),
      makeCaso({ resolucionTribunal: "Acoge" }),
      makeCaso({ resolucionTribunal: "Rechaza" }),
      makeCaso({ resolucionTribunal: "Desiste" }),
      makeCaso({ resolucionTribunal: null }),
    ];

    const resultado = bucketResolucion(casos);

    expect(resultado.sinResolucion).toBe(1);
    expect(resultado.buckets).toEqual([
      { resolucion: "Acoge", count: 2 },
      { resolucion: "Rechaza", count: 1 },
      { resolucion: "Otros", count: 1 },
    ]);
  });
});

describe("promedioDiasMp", () => {
  it("promedia días entre Fecha de creación y Fecha Presentación solo para Casos MP con ambas fechas", () => {
    const casos = [
      makeCaso({
        tipoCaso: "MP",
        fechaCreacionAccionLegal: new Date(2026, 0, 1),
        fechaPresentacion: new Date(2026, 0, 11),
      }),
      makeCaso({
        tipoCaso: "MP",
        fechaCreacionAccionLegal: new Date(2026, 0, 1),
        fechaPresentacion: new Date(2026, 0, 21),
      }),
      makeCaso({
        tipoCaso: "Demanda",
        fechaCreacionAccionLegal: new Date(2026, 0, 1),
        fechaPresentacion: new Date(2026, 0, 2),
      }),
      makeCaso({ tipoCaso: "MP", fechaCreacionAccionLegal: null }),
    ];

    expect(promedioDiasMp(casos)).toBe(15);
  });

  it("devuelve null si no hay ningún Caso MP con ambas fechas", () => {
    expect(promedioDiasMp([makeCaso({ tipoCaso: "Demanda" })])).toBeNull();
  });
});
