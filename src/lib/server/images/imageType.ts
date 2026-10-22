export interface ImageType {
  extension: string;
  contentType: string;
}

const textDecoder = new TextDecoder();

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function asciiAt(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + length));
}

/** Whether text is an SVG document: an <svg> element first, after any XML declaration, doctype or comments */
function isSVG(bytes: Uint8Array): boolean {
  const start = textDecoder
    .decode(bytes.subarray(0, 1024))
    .replace(/<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<!DOCTYPE[^>]*>/gi, "")
    .trimStart();
  return start.startsWith("<svg");
}

/**
 * The image type a file's first bytes show, or null when it isn't an image the site accepts. It reads the bytes
 * rather than trusting the file's name, so R2 serves each image with the right content type.
 */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { extension: "jpg", contentType: "image/jpeg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { extension: "png", contentType: "image/png" };
  if (asciiAt(bytes, 0, 6) === "GIF87a" || asciiAt(bytes, 0, 6) === "GIF89a") return { extension: "gif", contentType: "image/gif" };
  if (asciiAt(bytes, 0, 4) === "RIFF" && asciiAt(bytes, 8, 4) === "WEBP") return { extension: "webp", contentType: "image/webp" };
  if (asciiAt(bytes, 4, 4) === "ftyp" && ["avif", "avis"].includes(asciiAt(bytes, 8, 4))) return { extension: "avif", contentType: "image/avif" };
  if (isSVG(bytes)) return { extension: "svg", contentType: "image/svg+xml" };
  return null;
}
