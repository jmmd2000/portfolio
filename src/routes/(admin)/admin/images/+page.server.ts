import { fail } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { formatArticleDate } from "$lib/server/content/articleDetails";
import { getImageReferences } from "$lib/server/content/imageReferences";
import { formText } from "$lib/server/formText";
import { imageUses } from "$lib/server/images/imageUses";
import { deleteImage, listImages, storageFailedMessage, type StoredImage } from "$lib/server/images/storage";
import type { Actions, PageServerLoad } from "./$types";

const nameSchema = z.string().min(1);

/** The images, or null when the storage can't be reached, so the page can say so instead of failing */
async function listImagesOrNull(): Promise<StoredImage[] | null> {
  try {
    return await listImages();
  } catch {
    return null;
  }
}

export const load: PageServerLoad = async ({ locals }) => {
  requireAdmin(locals);

  const [images, references] = await Promise.all([listImagesOrNull(), getImageReferences()]);
  if (!images) return { images: [], storageUsed: 0, failed: true };

  const uses = imageUses(
    images.map(image => image.url),
    references
  );
  return {
    images: images.map(image => ({ name: image.name, url: image.url, size: image.size, uploaded: formatArticleDate(image.uploadedAt), usedBy: uses.get(image.url) ?? [] })),
    storageUsed: images.reduce((total, image) => total + image.size, 0),
    failed: false,
  };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    requireAdmin(locals);

    const result = nameSchema.safeParse(formText(await request.formData()).name);
    if (!result.success) return fail(400, { deleted: false, message: "Choose an image to delete." });

    try {
      await deleteImage(result.data);
    } catch {
      return fail(502, { deleted: false, message: storageFailedMessage });
    }
    return { deleted: true, message: `${result.data} deleted. Cloudflare can keep showing it for a while from its cache.` };
  },
};
