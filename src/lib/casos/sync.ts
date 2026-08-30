import { prisma } from "@/lib/prisma";
import type { CasoImportRow } from "./types";

export async function syncCasos(rows: CasoImportRow[]) {
  const ots = rows.map((row) => row.ot);

  const existing = await prisma.caso.findMany({
    where: { ot: { in: ots } },
    select: { ot: true },
  });
  const existingOts = new Set(existing.map((caso) => caso.ot));

  for (const { ot, ...fields } of rows) {
    await prisma.caso.upsert({
      where: { ot },
      create: { ot, ...fields, activo: true },
      update: { ...fields, activo: true },
    });
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
