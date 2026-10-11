import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { requireAdmin } from "$lib/server/auth/requireAdmin";
import { renderMarkdown } from "$lib/server/markdown/renderMarkdown";
import { articleBody } from "$lib/schemas/article";
import type { RequestHandler } from "./$types";

const previewRequestSchema = z.object({ markdown: articleBody });

/** Renders markdown the same way the public article page does, for the editor's live preview */
export const POST: RequestHandler = async ({ request, locals }) => {
  requireAdmin(locals);

  const requestBody: unknown = await request.json().catch(() => null);
  const result = previewRequestSchema.safeParse(requestBody);
  if (!result.success) error(400, "Send the markdown to preview, up to 100,000 characters");

  return json({ html: await renderMarkdown(result.data.markdown) });
};
