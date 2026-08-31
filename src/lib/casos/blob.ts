import { decodeCsvBuffer } from "./encoding";

export async function readBlob(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!response.ok) {
    throw new Error(
      `No se pudo leer el archivo subido (HTTP ${response.status}).`,
    );
  }
  return decodeCsvBuffer(await response.arrayBuffer());
}
