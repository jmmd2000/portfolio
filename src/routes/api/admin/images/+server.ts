import { error, json } from "@sveltejs/kit";
import { maxUploadBytes } from "$lib/images/limits";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { randomSuffix, uploadName } from "$lib/server/images/imageName";
import { detectImageType } from "$lib/server/images/imageType";
import { listImages, uploadImage } from "$lib/server/images/storage";
import type { RequestHandler } from "./$types";

const storageFailedMessage = "The image storage couldn't be reached. Try again in a minute.";

/** Every image in the bucket, newest first */
export const GET: RequestHandler = async ({ locals }) => {
  requireAdmin(locals);

  try {
    return json(await listImages());
  } catch {
    error(502, storageFailedMessage);
  }
};

/** Stores one image, sent as the form's `file` field, under a safe and unique name. Returns the stored image */
export const POST: RequestHandler = async ({ request, locals }) => {
  requireAdmin(locals);

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) error(400, "Send an image as the form's file field");
  if (file.size > maxUploadBytes) error(413, "Images can be up to 10 MB");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) error(415, "Only JPEG, PNG, GIF, WebP, AVIF and SVG images can be uploaded");

  try {
    const image = await uploadImage(uploadName(file.name, type.extension, randomSuffix()), bytes, type.contentType);
    return json(image, { status: 201 });
  } catch {
    error(502, storageFailedMessage);
  }
};
