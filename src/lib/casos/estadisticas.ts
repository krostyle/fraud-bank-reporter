import { prisma } from "@/lib/prisma";
import { buildCasoWhere, type CasoContentFilters } from "./where";

export type Periodo = "actual" | "ultimoAnio" | "historico";

export type EstadisticasFilters = CasoContentFilters & {
  periodo?: Periodo;
  activo?: "activos" | "inactivos" | "todos";
};

export type CasoEstadistica = {
  ot: string;
  tipoCaso: string | null;
  fechaEnvioFiscalia: Date | null;
  fechaPresentacion: Date | null;
  fechaCreacionAccionLegal: Date | null;
  resolucionTribunal: string | null;
  estadoAccionLegal: string | null;
  abogadoAsignado: string | null;
  montoTotalSuspendidoClp: { toNumber(): number } | number | null;
  regionId: string | null;
  regionNombre: string | null;
  comunaId: string | null;
  comunaNombre: string | null;
};

export function fechaReferencia(caso: CasoEstadistica): Date | null {
  return caso.tipoCaso === "MP" ? caso.fechaEnvioFiscalia : caso.fechaPresentacion;
}

export function filtrarPorPeriodo(
  casos: CasoEstadistica[],
  periodo: Periodo,
  ahora: Date,
): CasoEstadistica[] {
  if (periodo === "historico") return casos;

  const anioActual = ahora.getFullYear();
  const anioMinimo = periodo === "ultimoAnio" ? anioActual - 1 : anioActual;

  return casos.filter((caso) => {
    const fecha = fechaReferencia(caso);
    return fecha !== null && fecha.getFullYear() >= anioMinimo;
  });
}

export function agruparPorMes(
  casos: CasoEstadistica[],
): Array<{ mes: string; count: number }> {
  const counts = new Map<string, number>();

  for (const caso of casos) {
    const fecha = fechaReferencia(caso);
    if (!fecha) continue;
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    counts.set(mes, (counts.get(mes) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, count]) => ({ mes, count }));
}

export function bucketResolucion(casos: CasoEstadistica[]): {
  buckets: Array<{ resolucion: "Acoge" | "Rechaza" | "Otros"; count: number }>;
  sinResolucion: number;
} {
  let acoge = 0;
  let rechaza = 0;
  let otros = 0;
  let sinResolucion = 0;

  for (const caso of casos) {
    if (!caso.resolucionTribunal) {
      sinResolucion++;
    } else if (caso.resolucionTribunal === "Acoge") {
      acoge++;
    } else if (caso.resolucionTribunal === "Rechaza") {
      rechaza++;
    } else {
      otros++;
    }
  }

  return {
    buckets: [
      { resolucion: "Acoge", count: acoge },
      { resolucion: "Rechaza", count: rechaza },
      { resolucion: "Otros", count: otros },
    ],
    sinResolucion,
  };
}

export function promedioDiasMp(casos: CasoEstadistica[]): number | null {
  const dias = casos
    .filter((c) => c.tipoCaso === "MP" && c.fechaCreacionAccionLegal && c.fechaPresentacion)
    .map((c) => {
      const inicio = c.fechaCreacionAccionLegal!.getTime();
      const fin = c.fechaPresentacion!.getTime();
      return (fin - inicio) / (1000 * 60 * 60 * 24);
    });

  if (dias.length === 0) return null;
  return dias.reduce((a, b) => a + b, 0) / dias.length;
}

export function agruparPorAbogado(
  casos: CasoEstadistica[],
): Array<{ abogado: string; count: number }> {
  const counts = new Map<string, number>();
  for (const caso of casos) {
    if (!caso.abogadoAsignado) continue;
    counts.set(caso.abogadoAsignado, (counts.get(caso.abogadoAsignado) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .map(([abogado, count]) => ({ abogado, count }));
}

export function agruparPorEstado(
  casos: CasoEstadistica[],
): Array<{ estado: string; count: number }> {
  const counts = new Map<string, number>();
  for (const caso of casos) {
    const estado = caso.estadoAccionLegal ?? "Sin estado";
    counts.set(estado, (counts.get(estado) ?? 0) + 1);
  }
  return [...counts.entries()].map(([estado, count]) => ({ estado, count }));
}

function montoNumero(monto: CasoEstadistica["montoTotalSuspendidoClp"]): number {
  if (monto === null) return 0;
  return typeof monto === "number" ? monto : monto.toNumber();
}

export function agruparPorGeografia(
  casos: CasoEstadistica[],
  regionSeleccionada: string | null,
): Array<{ nombre: string; count: number; montoClp: number }> {
  const usarComuna = regionSeleccionada !== null;
  const grupos = new Map<string, { count: number; montoClp: number }>();

  for (const caso of casos) {
    const nombre = usarComuna ? caso.comunaNombre : caso.regionNombre;
    if (!nombre) continue;
    const actual = grupos.get(nombre) ?? { count: 0, montoClp: 0 };
    actual.count += 1;
    actual.montoClp += montoNumero(caso.montoTotalSuspendidoClp);
    grupos.set(nombre, actual);
  }

  return [...grupos.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([nombre, valores]) => ({ nombre, ...valores }));
}

export async function getEstadisticas(filters: EstadisticasFilters) {
  const where = buildCasoWhere(filters);

  if (filters.activo === "inactivos") {
    where.activo = false;
  } else if (filters.activo !== "todos") {
    where.activo = true;
  }

  const casos = await prisma.caso.findMany({
    where,
    select: {
      ot: true,
      tipoCaso: true,
      fechaEnvioFiscalia: true,
      fechaPresentacion: true,
      fechaCreacionAccionLegal: true,
      resolucionTribunal: true,
      estadoAccionLegal: true,
      abogadoAsignado: true,
      montoTotalSuspendidoClp: true,
      regionId: true,
      region: { select: { nombre: true } },
      comunaId: true,
      comuna: { select: { nombre: true } },
    },
  });

  const casosEstadistica: CasoEstadistica[] = casos.map((caso) => ({
    ot: caso.ot,
    tipoCaso: caso.tipoCaso,
    fechaEnvioFiscalia: caso.fechaEnvioFiscalia,
    fechaPresentacion: caso.fechaPresentacion,
    fechaCreacionAccionLegal: caso.fechaCreacionAccionLegal,
    resolucionTribunal: caso.resolucionTribunal,
    estadoAccionLegal: caso.estadoAccionLegal,
    abogadoAsignado: caso.abogadoAsignado,
    montoTotalSuspendidoClp: caso.montoTotalSuspendidoClp,
    regionId: caso.regionId,
    regionNombre: caso.region?.nombre ?? null,
    comunaId: caso.comunaId,
    comunaNombre: caso.comuna?.nombre ?? null,
  }));

  const periodo = filters.periodo ?? "actual";
  const enPeriodo = filtrarPorPeriodo(casosEstadistica, periodo, new Date());

  const { buckets: resolucionBuckets, sinResolucion } = bucketResolucion(enPeriodo);

  return {
    periodo,
    evolucionMensual: agruparPorMes(enPeriodo),
    geografia: agruparPorGeografia(enPeriodo, filters.regionId ?? null),
    resolucionTribunal: { buckets: resolucionBuckets, sinResolucion },
    cargaPorAbogado: agruparPorAbogado(enPeriodo),
    porEstado: agruparPorEstado(enPeriodo),
    promedioDiasAsignacionPresentacionMp: promedioDiasMp(enPeriodo),
  };
}
