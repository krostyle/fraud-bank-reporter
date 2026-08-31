import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { buildCasoWhere, getOpcionesFiltro, type CasoContentFilters } from "./where";

const PAGE_SIZE = 25;

export type CasosDashboardFilters = CasoContentFilters & {
  activo?: "activos" | "inactivos" | "todos";
  page?: number;
};

export async function getCasosDashboard(filters: CasosDashboardFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  // Filtros que comparten la tabla y los KPIs — todo menos el toggle
  // activo/inactivo, para que los KPIs reflejen la búsqueda actual pero
  // sigan mostrando el desglose activos/inactivos completo (si dependieran
  // también del toggle, filtrar por "Inactivos" dejaría la tarjeta "Casos
  // activos" en 0, lo cual es redundante con la tarjeta de inactivos).
  const sharedWhere = buildCasoWhere(filters);

  const where: Prisma.CasoWhereInput = { ...sharedWhere };

  if (filters.activo === "inactivos") {
    where.activo = false;
  } else if (filters.activo !== "todos") {
    where.activo = true;
  }

  const [casos, totalCount, activos, inactivos, montoAgg, porEstado, opcionesFiltro] =
    await Promise.all([
      prisma.caso.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { ot: "asc" },
      }),
      prisma.caso.count({ where }),
      prisma.caso.count({ where: { ...sharedWhere, activo: true } }),
      prisma.caso.count({ where: { ...sharedWhere, activo: false } }),
      prisma.caso.aggregate({
        where: { ...sharedWhere, activo: true },
        _sum: { montoTotalSuspendidoClp: true },
      }),
      prisma.caso.groupBy({
        by: ["estadoAccionLegal"],
        where: { ...sharedWhere, activo: true },
        _count: { _all: true },
      }),
      getOpcionesFiltro(),
    ]);

  return {
    casos,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    ...opcionesFiltro,
    kpis: {
      activos,
      inactivos,
      montoTotalSuspendidoClp: montoAgg._sum.montoTotalSuspendidoClp?.toNumber() ?? 0,
      porEstado: porEstado.map((grupo) => ({
        estado: grupo.estadoAccionLegal ?? "Sin estado",
        count: grupo._count._all,
      })),
    },
  };
}
