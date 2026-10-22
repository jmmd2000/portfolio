import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client, type ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { env } from "$lib/server/env";

/** One image in the bucket, as the admin lists it */
export interface StoredImage {
  name: string;
  /** Its public address */
  url: string;
  /** In bytes */
  size: number;
  uploadedAt: Date;
}

const client = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

export function imageURL(name: string): string {
  return `${env.ASSETS_URL}/${encodeURIComponent(name)}`;
}

/** Every image in the bucket, newest first. R2 returns up to 1,000 names at a time and not by date, so this reads every page and sorts them */
export async function listImages(): Promise<StoredImage[]> {
  const images: StoredImage[] = [];
  let continuationToken: string | undefined;

  do {
    const page: ListObjectsV2CommandOutput = await client.send(new ListObjectsV2Command({ Bucket: env.R2_BUCKET, ContinuationToken: continuationToken }));
    for (const object of page.Contents ?? []) {
      if (!object.Key) continue;
      images.push({ name: object.Key, url: imageURL(object.Key), size: object.Size ?? 0, uploadedAt: object.LastModified ?? new Date(0) });
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return images.toSorted((first, second) => second.uploadedAt.getTime() - first.uploadedAt.getTime());
}

/**
 * Stores an image under a new name and returns it. R2 refuses the upload if the name is already taken, so an upload
 * never replaces another image. Names are unique, so browsers and Cloudflare may cache each image for a year.
 */
export async function uploadImage(name: string, body: Uint8Array, contentType: string): Promise<StoredImage> {
  await client.send(new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: name, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable", IfNoneMatch: "*" }));
  return { name, url: imageURL(name), size: body.byteLength, uploadedAt: new Date() };
}

export async function deleteImage(name: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: name }));
}
