import { describe, expect, it } from "vitest";
import { fixMojibake } from "./encoding";

describe("fixMojibake", () => {
  it("repara un header con mojibake de doble codificación UTF-8 -> Latin-1", () => {
    expect(fixMojibake('Caso: NÃºmero del caso')).toBe("Caso: Número del caso");
  });

  it("repara ñ mal codificada", () => {
    const mojibake = Buffer.from("NUÑOA", "utf8").toString("latin1");
    expect(fixMojibake(mojibake)).toBe("NUÑOA");
  });

  it("deja intacto un texto sin tildes ni ñ", () => {
    expect(fixMojibake("LUIS RICARDO FERNANDEZ PIMENTEL")).toBe(
      "LUIS RICARDO FERNANDEZ PIMENTEL",
    );
  });

  it("deja intacto un string vacío", () => {
    expect(fixMojibake("")).toBe("");
  });
});
