import { describe, expect, it } from "vitest";
import { decodeCsvBuffer, fixMojibake } from "./encoding";

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

  it("deja intacto un texto ya correctamente codificado (no mojibake)", () => {
    expect(fixMojibake("Caso: Número del caso, NUÑOA")).toBe(
      "Caso: Número del caso, NUÑOA",
    );
  });
});

describe("decodeCsvBuffer", () => {
  it("decodifica un archivo UTF-16LE con BOM", () => {
    const text = "Caso: Número del caso\nNUÑOA";
    const utf16leBytes = Buffer.from(text, "utf16le");
    const bom = Buffer.from([0xff, 0xfe]);
    const buffer = Buffer.concat([bom, utf16leBytes]);

    expect(decodeCsvBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))).toBe(text);
  });

  it("decodifica un archivo UTF-8 sin BOM tal cual (incluye mojibake si lo trae)", () => {
    const text = 'Caso: NÃºmero del caso';
    const buffer = Buffer.from(text, "utf8");

    expect(decodeCsvBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))).toBe(text);
  });

  it("saca el BOM de un archivo UTF-8 con BOM", () => {
    const text = "Caso: Número del caso";
    const bom = Buffer.from([0xef, 0xbb, 0xbf]);
    const buffer = Buffer.concat([bom, Buffer.from(text, "utf8")]);

    expect(decodeCsvBuffer(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))).toBe(text);
  });
});
