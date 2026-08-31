import { prisma } from "@/lib/prisma";
import type { DenunciaRow } from "./denuncias-fiscalia";

const UPDATE_BATCH_SIZE = 20;

async function matchingOts(rows: DenunciaRow[]): Promise<Set<string>> {
  const ots = rows.map((row) => row.ot);
  const existing = await prisma.caso.findMany({
    where: { ot: { in: ots } },
    select: { ot: true },
  });
  return new Set(existing.map((caso) => caso.ot));
}

export async function syncDenuncias(rows: DenunciaRow[]) {
  const existingOts = await matchingOts(rows);
  const matched = rows.filter((row) => existingOts.has(row.ot));

  for (let i = 0; i < matched.length; i += UPDATE_BATCH_SIZE) {
    const batch = matched.slice(i, i + UPDATE_BATCH_SIZE);

    await Promise.all(
      batch.map(({ ot, otUr, fechaRecepcion, estadoFiscalia }) =>
        prisma.caso.update({
          where: { ot },
          data: { otUr, fechaRecepcion, estadoFiscalia },
        }),
      ),
    );
  }

  return {
    actualizados: matched.length,
    sinMatch: rows.length - matched.length,
  };
}

export async function previewSyncDenuncias(rows: DenunciaRow[]) {
  const existingOts = await matchingOts(rows);
  const actualizados = rows.filter((row) => existingOts.has(row.ot)).length;

  return {
    actualizados,
    sinMatch: rows.length - actualizados,
  };
}
