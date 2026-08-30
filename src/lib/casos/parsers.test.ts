import { describe, expect, it } from "vitest";
import { parseFechaHora, parseMontoUf } from "./parsers";

describe("parseMontoUf", () => {
  it("parsea un monto positivo con coma decimal", () => {
    expect(parseMontoUf("17,84717275")).toBe(17.84717275);
  });

  it("parsea un monto negativo con coma decimal", () => {
    expect(parseMontoUf("-3,70587915")).toBe(-3.70587915);
  });

  it("devuelve null para un valor vacío", () => {
    expect(parseMontoUf("")).toBeNull();
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
