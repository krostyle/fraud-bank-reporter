import { describe, expect, it } from "vitest";
import { parseFechaHora, parseMontoClp } from "./parsers";

describe("parseMontoClp", () => {
  it("parsea un monto con separador de miles", () => {
    expect(parseMontoClp("1.234.567")).toBe(1234567);
  });

  it("parsea un monto con separador de miles y decimales", () => {
    expect(parseMontoClp("1.234.567,5")).toBe(1234567.5);
  });

  it("parsea un monto sin separador de miles", () => {
    expect(parseMontoClp("1234567")).toBe(1234567);
  });

  it("parsea un monto negativo", () => {
    expect(parseMontoClp("-1.234.567")).toBe(-1234567);
  });

  it("devuelve null para un valor vacío", () => {
    expect(parseMontoClp("")).toBeNull();
  });
});

describe("parseFechaHora", () => {
  it("parsea una fecha sin hora (dd-mm-aaaa)", () => {
    const result = parseFechaHora("30-01-2026");
    expect(result?.toISOString()).toBe(new Date(2026, 0, 30).toISOString());
  });

  it("parsea una fecha con hora (dd-mm-aaaa, HH:mm)", () => {
    const result = parseFechaHora("27-01-2026, 13:23");
    expect(result?.toISOString()).toBe(
      new Date(2026, 0, 27, 13, 23).toISOString(),
    );
  });

  it("devuelve null para un valor vacío", () => {
    expect(parseFechaHora("")).toBeNull();
  });
});
