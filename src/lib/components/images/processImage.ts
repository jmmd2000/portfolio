import { convertedName, resizedSize } from "$lib/images/resize";
import type { UploadSettings } from "$lib/images/uploadSettings";

export interface ProcessedImage {
  file: Blob;
  name: string;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality));
}

/**
 * Resizes a JPEG or PNG to the maximum width and compresses it, as WebP when that's chosen. Every other image comes
 * back unchanged, so SVGs and animated GIFs keep what makes them work. The original also comes back when processing
 * would only make the file bigger.
 */
export async function processImage(file: File, settings: UploadSettings): Promise<ProcessedImage> {
  const original = { file, name: file.name };
  if (file.type !== "image/jpeg" && file.type !== "image/png") return original;

  const bitmap = await createImageBitmap(file);
  const size = resizedSize({ width: bitmap.width, height: bitmap.height }, settings.maxWidth);
  const resized = size.width !== bitmap.width;
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();

  const blob = await canvasBlob(canvas, settings.convertToWebP ? "image/webp" : file.type, settings.quality / 100);
  if (!blob) return original;

  if (!resized && blob.size >= file.size) return original;

  // A browser that can't make the type asked for makes a PNG instead, so the name follows what it really made
  return { file: blob, name: convertedName(file.name, blob.type) };
}
