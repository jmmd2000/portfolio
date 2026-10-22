import { slugify } from "$lib/slugify";

const maxBaseLength = 60;

/**
 * A safe, unique name for an upload: the original name without its extension, made lowercase and URL-safe, then a
 * short random suffix and the extension of the type the file really is. "My Photo (1).PNG" becomes
 * "my-photo-1-3f9a2c1b.webp" when the file is a WebP.
 */
export function uploadName(originalName: string, extension: string, suffix: string): string {
  const withoutExtension = originalName.replace(/\.[^.]*$/, "");
  const base = slugify(withoutExtension).slice(0, maxBaseLength).replace(/-$/, "") || "image";
  return `${base}-${suffix}.${extension}`;
}

/** Eight random lowercase letters and digits, so two uploads with the same name never share an address */
export function randomSuffix(): string {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 8);
}
