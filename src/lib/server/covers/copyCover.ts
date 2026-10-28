import { maxUploadBytes } from "$lib/images/limits";
import { randomSuffix, uploadName } from "$lib/server/images/imageName";
import { detectImageType, type ImageType } from "$lib/server/images/imageType";
import { uploadImage, type StoredImage } from "$lib/server/images/storage";
import { coverRequestHeaders, coverRequestMilliseconds } from "./coverResult";

/**
 * The hosts the sources serve their covers from. Open Library's covers redirect to archive.org's file servers, such
 * as ia801601.us.archive.org, so a host's subdomains count too.
 */
const coverHosts = ["i.scdn.co", "shared.akamai.steamstatic.com", "static.tvmaze.com", "covers.openlibrary.org", "archive.org"];
const maxRedirects = 3;
const copyableTypes = ["image/jpeg", "image/png", "image/webp"];

/** Thrown when a cover isn't one the site will copy: the wrong host, too big, or not a JPEG, PNG or WebP */
export class RefusedCover extends Error {}

/** Whether an address is https, on the default port, on one of the sources' cover hosts */
export function isCoverHost(url: URL): boolean {
  if (url.protocol !== "https:" || url.port !== "") return false;
  return coverHosts.some(host => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}

/**
 * Downloads a cover from one of the sources' cover hosts. It follows up to three redirects, each checked against
 * the same hosts. Throws RefusedCover for an address, a redirect or a file the site won't copy, and an Error when
 * the host fails.
 */
export async function downloadCover(address: string, fetchFunction: typeof fetch = fetch): Promise<{ bytes: Uint8Array; type: ImageType }> {
  const signal = AbortSignal.timeout(coverRequestMilliseconds);
  let url = new URL(address);

  for (let redirects = 0; redirects <= maxRedirects; redirects++) {
    if (!isCoverHost(url)) throw new RefusedCover(`Covers can't be copied from ${url.host}`);

    const response = await fetchFunction(url, { redirect: "manual", headers: coverRequestHeaders, signal });
    if (isRedirect(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("The cover's host redirected without saying where");
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) throw new Error(`The cover's host answered ${response.status}`);
    if (Number(response.headers.get("content-length") ?? 0) > maxUploadBytes) throw new RefusedCover("The cover is over 10 MB");

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > maxUploadBytes) throw new RefusedCover("The cover is over 10 MB");

    const type = detectImageType(bytes);
    if (!type || !copyableTypes.includes(type.contentType)) throw new RefusedCover("The cover isn't a JPEG, PNG or WebP image");
    return { bytes, type };
  }
  throw new RefusedCover("The cover's address redirected too many times");
}

/** Copies a cover into the image library, named after its title, and returns the stored image */
export async function copyCover(coverURL: string, title: string): Promise<StoredImage> {
  const { bytes, type } = await downloadCover(coverURL);
  // The extension goes on the title so a dot in it, as in "Mr. Robot", isn't taken for one
  return uploadImage(uploadName(`${title}.${type.extension}`, type.extension, randomSuffix()), bytes, type.contentType);
}
