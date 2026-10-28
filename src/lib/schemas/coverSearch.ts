import { z } from "zod";

export const coverSources = ["album", "game", "show", "book"] as const;

export type CoverSource = (typeof coverSources)[number];

export const coverSearchSchema = z.object({
  source: z.enum(coverSources),
  query: z.string().trim().min(1).max(200),
});

export const coverResultsSchema = z.array(
  z.object({
    title: z.string(),
    subtitle: z.string().nullable(),
    maker: z.string().nullable(),
    pageURL: z.url().nullable(),
    thumbnailURL: z.url(),
    coverURL: z.url(),
  })
);

export type CoverResults = z.infer<typeof coverResultsSchema>;

/** A picked cover to copy into the image library. Its title names the copy */
export const coverCopySchema = z.object({
  coverURL: z.url(),
  title: z.string().trim().min(1).max(200),
});
