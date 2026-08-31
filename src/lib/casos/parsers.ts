export function parseMontoClp(value: string): number | null {
  if (value === "") return null;
  return Number(value.replace(/\./g, "").replace(",", "."));
}

const FECHA_HORA_RE =
  /^(\d{2})-(\d{2})-(\d{4})(?:,\s*(\d{2}):(\d{2}))?$/;

export function parseFechaHora(value: string): Date | null {
  if (value === "") return null;

  const match = FECHA_HORA_RE.exec(value);
  if (!match) return null;

  const [, dd, mm, yyyy, hh, min] = match;
  return new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    hh ? Number(hh) : 0,
    min ? Number(min) : 0,
  );
}
