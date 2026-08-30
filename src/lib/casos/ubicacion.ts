import { prisma } from "@/lib/prisma";

export function parseRegionComuna(
  raw: string | null,
): { region: string | null; comuna: string | null } {
  if (!raw) return { region: null, comuna: null };

  const [region, comuna] = raw.split(",").map((part) => part.trim());

  return {
    region: region || null,
    comuna: comuna || null,
  };
}

export async function resolveUbicacion(
  raw: string | null,
): Promise<{ regionId: string | null; comunaId: string | null }> {
  const { region, comuna } = parseRegionComuna(raw);

  if (!region || !comuna) {
    return { regionId: null, comunaId: null };
  }

  const regionRow = await prisma.region.upsert({
    where: { nombre: region },
    create: { nombre: region },
    update: {},
  });

  const comunaRow = await prisma.comuna.upsert({
    where: { regionId_nombre: { regionId: regionRow.id, nombre: comuna } },
    create: { nombre: comuna, regionId: regionRow.id },
    update: {},
  });

  return { regionId: regionRow.id, comunaId: comunaRow.id };
}

const RESOLVE_BATCH_SIZE = 10;

export async function resolveUbicacionesBatch(
  rawValues: Array<string | null>,
): Promise<Map<string, { regionId: string | null; comunaId: string | null }>> {
  const unique = [...new Set(rawValues.filter((raw): raw is string => !!raw))];
  const map = new Map<string, { regionId: string | null; comunaId: string | null }>();

  for (let i = 0; i < unique.length; i += RESOLVE_BATCH_SIZE) {
    const batch = unique.slice(i, i + RESOLVE_BATCH_SIZE);
    const resolved = await Promise.all(batch.map((raw) => resolveUbicacion(raw)));
    batch.forEach((raw, index) => map.set(raw, resolved[index]));
  }

  return map;
}
