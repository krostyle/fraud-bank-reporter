import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 25;

export type CasosDashboardFilters = {
  q?: string;
  estado?: string;
  ubicacion?: string;
  activo?: "activos" | "inactivos" | "todos";
  page?: number;
};

export async function getCasosDashboard(filters: CasosDashboardFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;

  const where: Prisma.CasoWhereInput = {};

  if (filters.activo === "inactivos") {
    where.activo = false;
  } else if (filters.activo !== "todos") {
    where.activo = true;
  }

  if (filters.q) {
    where.OR = [
      { ot: { contains: filters.q, mode: "insensitive" } },
      { rut: { contains: filters.q, mode: "insensitive" } },
      { nombreContacto: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.estado) {
    where.estadoAccionLegal = filters.estado;
  }

  if (filters.ubicacion) {
    where.localidadComunaRegion = {
      contains: filters.ubicacion,
      mode: "insensitive",
    };
  }

  const [
    casos,
    totalCount,
    activos,
    inactivos,
    montoAgg,
    porEstado,
    estadosRows,
  ] = await Promise.all([
    prisma.caso.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { ot: "asc" },
    }),
    prisma.caso.count({ where }),
    prisma.caso.count({ where: { activo: true } }),
    prisma.caso.count({ where: { activo: false } }),
    prisma.caso.aggregate({
      where: { activo: true },
      _sum: { montoTotalReclamadoUf: true },
    }),
    prisma.caso.groupBy({
      by: ["estadoAccionLegal"],
      where: { activo: true },
      _count: { _all: true },
    }),
    prisma.caso.findMany({
      distinct: ["estadoAccionLegal"],
      select: { estadoAccionLegal: true },
      where: { estadoAccionLegal: { not: null } },
      orderBy: { estadoAccionLegal: "asc" },
    }),
  ]);

  return {
    casos,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    estadosDisponibles: estadosRows.map((row) => row.estadoAccionLegal as string),
    kpis: {
      activos,
      inactivos,
      montoTotalActivosUf: montoAgg._sum.montoTotalReclamadoUf?.toNumber() ?? 0,
      porEstado: porEstado.map((grupo) => ({
        estado: grupo.estadoAccionLegal ?? "Sin estado",
        count: grupo._count._all,
      })),
    },
  };
}
