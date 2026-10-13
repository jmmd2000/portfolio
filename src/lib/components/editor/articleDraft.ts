import { z } from "zod";

const draftSchema = z.object({
  title: z.string(),
  summary: z.string(),
  body: z.string(),
  savedAt: z.coerce.date(),
});

/** The article text the editor keeps in the browser until it's saved */
export type ArticleDraft = z.infer<typeof draftSchema>;

export type DraftText = Pick<ArticleDraft, "title" | "summary" | "body">;

const timeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "long", timeZone: "Europe/Dublin" });

function storageKey(articleID: number): string {
  return `article-draft-${articleID}`;
}

/** The article's kept draft, or null when there's none, it can't be read, or the browser blocks storage */
export function readDraft(articleID: number): ArticleDraft | null {
  try {
    const stored = localStorage.getItem(storageKey(articleID));
    if (stored === null) return null;

    const result = draftSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Keeps the draft. Does nothing when the browser blocks storage or it's full */
export function writeDraft(articleID: number, draft: ArticleDraft): void {
  try {
    localStorage.setItem(storageKey(articleID), JSON.stringify(draft));
  } catch {
    // Without storage the editor still works, it just can't keep a draft
  }
}

export function clearDraft(articleID: number): void {
  try {
    localStorage.removeItem(storageKey(articleID));
  } catch {
    // Nothing was kept if storage is blocked
  }
}

/**
 * Whether a kept draft is worth offering: it's newer than the last save and its text differs from what's saved.
 * It compares the browser's clock with the server's, which is close enough for one person on their own devices.
 */
export function isWorthRestoring(draft: ArticleDraft, saved: DraftText, savedAt: Date): boolean {
  if (draft.savedAt <= savedAt) return false;

  return draft.title !== saved.title || draft.summary !== saved.summary || draft.body !== saved.body;
}

/** When the draft was kept, in Irish time, like "14:05 on 13 October" */
export function formatDraftTime(date: Date): string {
  const parts = timeFormat.formatToParts(date);
  const partValue = (type: string) => parts.find(part => part.type === type)?.value;
  return `${partValue("hour")}:${partValue("minute")} on ${partValue("day")} ${partValue("month")}`;
}
