import { z } from "zod";
import { resolve } from "$app/paths";

const previewDelay = 400;
const previewResponseSchema = z.object({ html: z.string(), readingMinutes: z.number() });

/**
 * The editor's live preview of an article body. The server renders the body about 400ms after typing stops,
 * with the same renderer as the public page. A newer request cancels an older one, so a slow response can't
 * replace a newer preview.
 */
export class LivePreview {
  html = $state("");
  readingMinutes = $state(1);
  /** True when the last render failed. The preview keeps showing the last good render */
  failed = $state(false);

  #timer: ReturnType<typeof setTimeout> | undefined;
  #request: AbortController | undefined;

  constructor(html: string, readingMinutes: number) {
    this.html = html;
    this.readingMinutes = readingMinutes;
  }

  /** Renders the markdown once typing stops. Each call restarts the wait */
  schedule(markdown: string): void {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => void this.#render(markdown), previewDelay);
  }

  /** Cancels any waiting or running render */
  stop(): void {
    clearTimeout(this.#timer);
    this.#request?.abort();
  }

  async #render(markdown: string): Promise<void> {
    this.#request?.abort();
    const request = new AbortController();
    this.#request = request;

    try {
      const response = await fetch(resolve("/api/admin/markdown-preview"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ markdown }),
        signal: request.signal,
      });
      if (!response.ok) throw new Error(`The preview request failed with status ${response.status}`);

      const result = previewResponseSchema.parse(await response.json());
      this.html = result.html;
      this.readingMinutes = result.readingMinutes;
      this.failed = false;
    } catch {
      if (request.signal.aborted) return;
      this.failed = true;
    }
  }
}
