import { prisma } from "@/lib/prisma";

export function getCasoByOt(ot: string) {
  return prisma.caso.findUnique({ where: { ot } });
}
