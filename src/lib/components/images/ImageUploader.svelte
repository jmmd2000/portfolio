<script lang="ts">
  import { onMount } from "svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Checkbox from "$lib/components/form/Checkbox.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import { formatBytes } from "$lib/images/formatBytes";
  import { maxUploadBytes } from "$lib/images/limits";
  import { defaultUploadSettings, readUploadSettings, writeUploadSettings, type UploadSettings } from "$lib/images/uploadSettings";
  import { processImage } from "./processImage";

  /** An image the server stored, as the images API returns it */
  export interface UploadedImage {
    name: string;
    url: string;
    size: number;
  }

  interface Props {
    /** Called after each image is stored */
    onuploaded?: (image: UploadedImage) => void;
    /** Called once every file picked or dropped together has finished, with the images that were stored */
    onfinished?: (images: UploadedImage[]) => void;
    /** Images dropped anywhere on the page upload too, with an outline while they're dragged over it */
    dropOnPage?: boolean;
    /** Shows the resize and quality settings. Without them, uploads use the last settings saved in this browser */
    showSettings?: boolean;
  }

  let { onuploaded, onfinished, dropOnPage = false, showSettings = true }: Props = $props();

  interface Upload {
    id: number;
    name: string;
    status: "working" | "done" | "failed";
    message: string;
  }

  let settings = $state<UploadSettings>(defaultUploadSettings);
  let uploads = $state<Upload[]>([]);
  let fileInput = $state<HTMLInputElement>();
  // Counts drags into and out of elements, since dragging over a child leaves its parent
  let dragDepth = $state(0);
  let nextID = 0;

  onMount(() => {
    settings = readUploadSettings(localStorage);
  });

  function changeSettings(changed: Partial<UploadSettings>): void {
    settings = { ...settings, ...changed };
    writeUploadSettings(localStorage, settings);
  }

  function numberFrom(event: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }, fallback: number): number {
    const value = Number.parseInt(event.currentTarget.value, 10);
    return Number.isNaN(value) ? fallback : value;
  }

  function updateUpload(id: number, changed: Partial<Upload>): void {
    uploads = uploads.map(upload => (upload.id === id ? { ...upload, ...changed } : upload));
  }

  async function errorMessage(response: Response): Promise<string> {
    const body: unknown = await response.json().catch(() => null);
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") return body.message;
    return "The upload failed. Try again.";
  }

  /** Processes and stores one image. Returns it, or null when it failed, with the reason shown in the list */
  async function upload(file: File): Promise<UploadedImage | null> {
    const id = nextID++;
    uploads = [{ id, name: file.name, status: "working", message: "Uploading" }, ...uploads];

    const processed = await processImage(file, settings).catch(() => ({ file, name: file.name }));
    if (processed.file.size > maxUploadBytes) {
      updateUpload(id, { status: "failed", message: `It's ${formatBytes(processed.file.size)}. Images can be up to 10 MB.` });
      return null;
    }

    const formData = new FormData();
    formData.append("file", processed.file, processed.name);
    const response = await fetch("/api/admin/images", { method: "POST", body: formData }).catch(() => null);
    if (!response?.ok) {
      updateUpload(id, { status: "failed", message: response ? await errorMessage(response) : "The upload failed. Check the connection and try again." });
      return null;
    }

    const image = (await response.json()) as UploadedImage;
    updateUpload(id, { status: "done", name: image.name, message: `${formatBytes(file.size)} → ${formatBytes(image.size)}` });
    onuploaded?.(image);
    return image;
  }

  async function uploadAll(files: FileList | null | undefined): Promise<void> {
    const results = await Promise.all(Array.from(files ?? [], upload));
    onfinished?.(results.filter(image => image !== null));
  }

  function carriesFiles(event: DragEvent): boolean {
    return dropOnPage && (event.dataTransfer?.types.includes("Files") ?? false);
  }

  function handleDragEnter(event: DragEvent): void {
    if (carriesFiles(event)) dragDepth++;
  }

  function handleDragLeave(event: DragEvent): void {
    if (carriesFiles(event)) dragDepth = Math.max(0, dragDepth - 1);
  }

  function handleDragOver(event: DragEvent): void {
    if (carriesFiles(event)) event.preventDefault();
  }

  function handleDrop(event: DragEvent): void {
    if (!carriesFiles(event)) return;

    event.preventDefault();
    dragDepth = 0;
    void uploadAll(event.dataTransfer?.files);
  }

  function handleChoose(event: Event & { currentTarget: HTMLInputElement }): void {
    void uploadAll(event.currentTarget.files);
    event.currentTarget.value = "";
  }
</script>

<svelte:window ondragenter={handleDragEnter} ondragleave={handleDragLeave} ondragover={handleDragOver} ondrop={handleDrop} />

<div class="uploader">
  <div class="controls">
    <Button variant="primary" onclick={() => fileInput?.click()}>Upload images</Button>
    <input bind:this={fileInput} type="file" accept="image/*" multiple hidden onchange={handleChoose} />

    {#if showSettings}
      <details class="settings">
        <summary>Upload settings</summary>
        <div class="settings-fields">
          <Field label="Maximum width (px)" type="number" min="16" max="10000" value={settings.maxWidth} oninput={event => changeSettings({ maxWidth: numberFrom(event, settings.maxWidth) })} />
          <Field label="Quality (1 to 100)" type="number" min="1" max="100" value={settings.quality} oninput={event => changeSettings({ quality: numberFrom(event, settings.quality) })} />
          <Checkbox label="Convert to WebP" checked={settings.convertToWebP} onchange={event => changeSettings({ convertToWebP: event.currentTarget.checked })} />
        </div>
        <p class="hint">Applies to JPEG and PNG images. SVGs, GIFs and WebP files are uploaded as they are. Up to 10 MB each.</p>
      </details>
    {/if}
  </div>

  {#if uploads.length > 0}
    <ul class="uploads" aria-live="polite">
      {#each uploads as item (item.id)}
        <li class={item.status}>
          <span class="upload-name">{item.name}</span>
          <span>{item.message}</span>
        </li>
      {/each}
    </ul>
  {/if}
</div>

{#if dragDepth > 0}
  <div class="drop-outline" aria-hidden="true"><span class="label">Drop to upload</span></div>
{/if}

<style>
  .uploader {
    display: grid;
    gap: var(--space-2);
    width: 100%;
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: var(--space-2) var(--space-3);
  }

  .settings {
    min-width: 0;

    summary {
      display: inline-flex;
      align-items: center;
      min-height: 2.75rem;
      font-weight: 700;
      text-decoration: underline;
      text-decoration-color: transparent;
      text-decoration-thickness: 3px;
      text-underline-offset: 5px;
      cursor: pointer;
      transition: text-decoration-color var(--duration-quick) var(--ease-out);
    }

    &[open] summary {
      text-decoration-color: var(--red);
    }
  }

  .settings-fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(11rem, 100%), 1fr));
    align-items: end;
    gap: var(--space-2);
    max-width: 40rem;
    margin-top: var(--space-1);
  }

  .hint {
    max-width: 40rem;
    margin-top: var(--space-1);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .uploads {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--type-small);
    font-weight: 600;

    li {
      display: flex;
      flex-wrap: wrap;
      gap: 0 var(--space-2);
      overflow-wrap: anywhere;
    }

    .working {
      color: var(--muted);
    }

    .failed {
      color: var(--red-text);
    }
  }

  .upload-name {
    font-weight: 700;
  }

  .drop-outline {
    position: fixed;
    inset: var(--space-1);
    z-index: 30;
    display: grid;
    place-items: center;
    border: 6px dashed var(--red);
    background: color-mix(in oklch, var(--paper) 70%, transparent);
    pointer-events: none;

    .label {
      padding: var(--space-1) var(--space-2);
      background: var(--ink);
      color: var(--paper);
    }
  }

  @media (hover: hover) {
    .settings summary:hover {
      text-decoration-color: var(--red);
    }
  }
</style>
