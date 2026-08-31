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

  // Filtros que comparten la tabla y los KPIs — todo menos el toggle
  // activo/inactivo, para que los KPIs reflejen la búsqueda actual pero
  // sigan mostrando el desglose activos/inactivos completo (si dependieran
  // también del toggle, filtrar por "Inactivos" dejaría la tarjeta "Casos
  // activos" en 0, lo cual es redundante con la tarjeta de inactivos).
  const sharedWhere: Prisma.CasoWhereInput = {};

  if (filters.q) {
    sharedWhere.OR = [
      { ot: { contains: filters.q, mode: "insensitive" } },
      { rut: { contains: filters.q, mode: "insensitive" } },
      { nombreContacto: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.estado) {
    sharedWhere.estadoAccionLegal = filters.estado;
  }

  if (filters.subStatus) {
    sharedWhere.subStatus = filters.subStatus;
  }

  if (filters.propietario) {
    sharedWhere.propietarioCaso = filters.propietario;
  }

  if (filters.regionId) {
    sharedWhere.regionId = filters.regionId;
  }

  if (filters.comunaId) {
    sharedWhere.comunaId = filters.comunaId;
  }

  const where: Prisma.CasoWhereInput = { ...sharedWhere };

  if (filters.activo === "inactivos") {
    where.activo = false;
  } else if (filters.activo !== "todos") {
    where.activo = true;
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
    prisma.caso.count({ where: { ...sharedWhere, activo: true } }),
    prisma.caso.count({ where: { ...sharedWhere, activo: false } }),
    prisma.caso.aggregate({
      where: { ...sharedWhere, activo: true },
      _sum: { montoTotalReclamadoUf: true },
    }),
    prisma.caso.groupBy({
      by: ["estadoAccionLegal"],
      where: { ...sharedWhere, activo: true },
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
