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

export function normalizeUbicacionText(value: string): string {
  return value
    .normalize("NFD")
    .replace(new RegExp("[\u0300-\u036f]", "g"), "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));

  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[a.length][b.length];
}

export function similarityRatio(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLength;
}

export type UbicacionCatalog = Array<{
  id: string;
  nombre: string;
  aliases: string[];
  comunas: Array<{ id: string; nombre: string }>;
}>;

const FUZZY_THRESHOLD = 0.82;

function findBestMatch(
  normalizedInput: string,
  candidates: Array<{ id: string; normalized: string }>,
): string | null {
  const exact = candidates.find((c) => c.normalized === normalizedInput);
  if (exact) return exact.id;

  let best: { id: string; score: number } | null = null;
  for (const candidate of candidates) {
    const score = similarityRatio(normalizedInput, candidate.normalized);
    if (score >= FUZZY_THRESHOLD && (!best || score > best.score)) {
      best = { id: candidate.id, score };
    }
  }

  return best?.id ?? null;
}

export function matchUbicacion(
  raw: string | null,
  catalog: UbicacionCatalog,
): { regionId: string | null; comunaId: string | null } {
  const { region, comuna } = parseRegionComuna(raw);
  if (!region || !comuna) return { regionId: null, comunaId: null };

  const regionCandidates = catalog.flatMap((r) =>
    [r.nombre, ...r.aliases].map((nombre) => ({
      id: r.id,
      normalized: normalizeUbicacionText(nombre),
    })),
  );
  const regionId = findBestMatch(normalizeUbicacionText(region), regionCandidates);
  if (!regionId) return { regionId: null, comunaId: null };

  const matchedRegion = catalog.find((r) => r.id === regionId);
  const comunaCandidates =
    matchedRegion?.comunas.map((c) => ({
      id: c.id,
      normalized: normalizeUbicacionText(c.nombre),
    })) ?? [];
  const comunaId = findBestMatch(normalizeUbicacionText(comuna), comunaCandidates);

  return { regionId, comunaId };
}

async function loadUbicacionCatalog(): Promise<UbicacionCatalog> {
  const regiones = await prisma.region.findMany({
    include: { comunas: { select: { id: true, nombre: true } } },
  });
  return regiones.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    aliases: r.aliases,
    comunas: r.comunas,
  }));
}

export async function resolveUbicacionesBatch(
  rawValues: Array<string | null>,
): Promise<Map<string, { regionId: string | null; comunaId: string | null }>> {
  const catalog = await loadUbicacionCatalog();
  const map = new Map<string, { regionId: string | null; comunaId: string | null }>();

  for (const raw of new Set(rawValues.filter((r): r is string => !!r))) {
    map.set(raw, matchUbicacion(raw, catalog));
  }

  return map;
}
