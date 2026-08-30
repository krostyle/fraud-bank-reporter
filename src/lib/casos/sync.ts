import { prisma } from "@/lib/prisma";
import { resolveUbicacionesBatch } from "./ubicacion";
import type { CasoImportRow } from "./types";

const UPSERT_BATCH_SIZE = 20;

export async function syncCasos(rows: CasoImportRow[]) {
  const ots = rows.map((row) => row.ot);

  const [existing, ubicaciones] = await Promise.all([
    prisma.caso.findMany({
      where: { ot: { in: ots } },
      select: { ot: true },
    }),
    resolveUbicacionesBatch(rows.map((row) => row.localidadComunaRegion)),
  ]);
  const existingOts = new Set(existing.map((caso) => caso.ot));

  for (let i = 0; i < rows.length; i += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(i, i + UPSERT_BATCH_SIZE);

    await Promise.all(
      batch.map(({ ot, ...fields }) => {
        const { regionId, comunaId } = fields.localidadComunaRegion
          ? (ubicaciones.get(fields.localidadComunaRegion) ?? {
              regionId: null,
              comunaId: null,
            })
          : { regionId: null, comunaId: null };

        return prisma.caso.upsert({
          where: { ot },
          create: { ot, ...fields, regionId, comunaId, activo: true },
          update: { ...fields, regionId, comunaId, activo: true },
        });
      }),
    );
  }

  const { count: deactivated } = await prisma.caso.updateMany({
    where: { ot: { notIn: ots }, activo: true },
    data: { activo: false },
  });

  return {
    created: rows.filter((row) => !existingOts.has(row.ot)).length,
    updated: rows.filter((row) => existingOts.has(row.ot)).length,
    deactivated,
  };
}

export async function previewSyncCasos(rows: CasoImportRow[]) {
  const ots = rows.map((row) => row.ot);

  const existing = await prisma.caso.findMany({
    where: { ot: { in: ots } },
    select: { ot: true },
  });
  const existingOts = new Set(existing.map((caso) => caso.ot));

  const toDeactivate = await prisma.caso.count({
    where: { ot: { notIn: ots }, activo: true },
  });

  return {
    toCreate: rows.filter((row) => !existingOts.has(row.ot)).length,
    toUpdate: rows.filter((row) => existingOts.has(row.ot)).length,
    toDeactivate,
  };
}
