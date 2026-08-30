const MOJIBAKE_MARKER = String.fromCharCode(0xc3);
const MOJIBAKE_PATTERN = new RegExp(`${MOJIBAKE_MARKER}[\\u0080-\\u00bf]`);

export function fixMojibake(value: string): string {
  if (!MOJIBAKE_PATTERN.test(value)) return value;
  return Buffer.from(value, "latin1").toString("utf8");
}

export function decodeCsvBuffer(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder("utf-16le").decode(bytes.subarray(2));
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder("utf-16be").decode(bytes.subarray(2));
  }

  const text = new TextDecoder("utf-8").decode(bytes);
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
