export interface ImageSize {
  width: number;
  height: number;
}

/** The size to draw an image at: scaled down to fit `maxWidth` and keep its shape, or its own size when it already fits. Never scaled up */
export function resizedSize(size: ImageSize, maxWidth: number): ImageSize {
  if (size.width <= maxWidth) return size;
  return { width: maxWidth, height: Math.max(1, Math.round((size.height * maxWidth) / size.width)) };
}

const extensions: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };

/** The file's name with the extension of the type it was converted to: "photo.PNG" as WebP becomes "photo.webp" */
export function convertedName(name: string, type: string): string {
  const extension = extensions[type];
  if (!extension) return name;
  return `${name.replace(/\.[^.]*$/, "")}.${extension}`;
}
