export function fixMojibake(value: string): string {
  return Buffer.from(value, "latin1").toString("utf8");
}
