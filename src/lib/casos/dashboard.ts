import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 25;

export type CasosDashboardFilters = {
  q?: string;
  estado?: string;
  subStatus?: string;
  propietario?: string;
  regionId?: string;
  comunaId?: string;
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

  if (filters.subStatus) {
    where.subStatus = filters.subStatus;
  }

  if (filters.propietario) {
    where.propietarioCaso = filters.propietario;
  }

  if (filters.regionId) {
    where.regionId = filters.regionId;
  }

  if (filters.comunaId) {
    where.comunaId = filters.comunaId;
  }

  const [
    casos,
    totalCount,
    activos,
    inactivos,
    montoAgg,
    porEstado,
    estadosRows,
    subStatusesRows,
    propietariosRows,
    regionesDisponibles,
    comunasDisponibles,
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
    prisma.caso.findMany({
      distinct: ["subStatus"],
      select: { subStatus: true },
      where: { subStatus: { not: null } },
      orderBy: { subStatus: "asc" },
    }),
    prisma.caso.findMany({
      distinct: ["propietarioCaso"],
      select: { propietarioCaso: true },
      where: { propietarioCaso: { not: null } },
      orderBy: { propietarioCaso: "asc" },
    }),
    prisma.region.findMany({
      where: { casos: { some: {} } },
      orderBy: { nombre: "asc" },
    }),
    prisma.comuna.findMany({
      where: { casos: { some: {} } },
      orderBy: { nombre: "asc" },
    }),
  ]);

  return {
    casos,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    estadosDisponibles: estadosRows.map((row) => row.estadoAccionLegal as string),
    subStatusesDisponibles: subStatusesRows.map((row) => row.subStatus as string),
    propietariosDisponibles: propietariosRows.map((row) => row.propietarioCaso as string),
    regionesDisponibles,
    comunasDisponibles,
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
