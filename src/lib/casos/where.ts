import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export type CasoContentFilters = {
  q?: string;
  estado?: string;
  subStatus?: string;
  abogado?: string;
  regionId?: string;
  comunaId?: string;
};

// Filtros de contenido compartidos entre el dashboard y las estadísticas —
// todo excepto el toggle activo/inactivo, que cada consumidor aplica según
// su propia necesidad (ver dashboard.ts para el motivo).
export function buildCasoWhere(filters: CasoContentFilters): Prisma.CasoWhereInput {
  const where: Prisma.CasoWhereInput = {};

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

  if (filters.abogado) {
    where.abogadoAsignado = filters.abogado;
  }

  if (filters.regionId) {
    where.regionId = filters.regionId;
  }

  if (filters.comunaId) {
    where.comunaId = filters.comunaId;
  }

  return where;
}

// Opciones disponibles para los selects de filtro — compartidas entre el
// dashboard principal y la página de Estadísticas.
export async function getOpcionesFiltro() {
  const [estadosRows, subStatusesRows, abogadosRows, regionesDisponibles, comunasDisponibles] =
    await Promise.all([
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
        distinct: ["abogadoAsignado"],
        select: { abogadoAsignado: true },
        where: { abogadoAsignado: { not: null } },
        orderBy: { abogadoAsignado: "asc" },
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
    estadosDisponibles: estadosRows.map((row) => row.estadoAccionLegal as string),
    subStatusesDisponibles: subStatusesRows.map((row) => row.subStatus as string),
    abogadosDisponibles: abogadosRows.map((row) => row.abogadoAsignado as string),
    regionesDisponibles,
    comunasDisponibles,
  };
}
