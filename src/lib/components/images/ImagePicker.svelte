<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import { z } from "zod";
  import Button from "$lib/components/form/Button.svelte";
  import ImageUploader, { type UploadedImage } from "./ImageUploader.svelte";

  interface Props {
    /** Called with the picked image's address, after the dialog closes */
    onpick: (url: string) => void;
    /** The opening button's text */
    label?: string;
    small?: boolean;
  }

  let { onpick, label = "Choose image", small = false }: Props = $props();

  const libraryImagesSchema = z.array(z.object({ name: z.string(), url: z.url() }));
  type LibraryImage = z.infer<typeof libraryImagesSchema>[number];

  const headingID = $props.id();

  let dialog = $state<HTMLDialogElement>();
  let images = $state<LibraryImage[]>([]);
  let status = $state<"loading" | "ready" | "failed">("loading");
  // Each opening counts up, so a list that arrives after the dialog closed or opened again is ignored
  let opening = 0;

  async function openPicker(): Promise<void> {
    dialog?.showModal();
    status = "loading";
    const thisOpening = ++opening;

    const response = await fetch("/api/admin/images").catch(() => null);
    const body: unknown = response?.ok ? await response.json().catch(() => null) : null;
    if (thisOpening !== opening || !dialog?.open) return;

    const result = libraryImagesSchema.safeParse(body);
    if (!result.success) {
      status = "failed";
      return;
    }
    images = result.data;
    status = "ready";
  }

  // Closes first, so the dialog gives focus back to its button before the form moves it somewhere else
  function pick(image: LibraryImage): void {
    dialog?.close();
    onpick(image.url);
  }

  function handleFinished(uploaded: UploadedImage[]): void {
    if (uploaded.length === 1) {
      pick(uploaded[0]);
      return;
    }
    images = [...uploaded, ...images];
  }

  // Keeps Escape, typing and changes inside the dialog away from the form around it and the page's own Escape handlers
  function keepInside(event: Event): void {
    event.stopPropagation();
  }
</script>

<Button {small} onclick={openPicker}>{label}</Button>

<dialog class="picker" aria-labelledby={headingID} bind:this={dialog} onkeydown={keepInside} oninput={keepInside} onchange={keepInside}>
  <div class="head">
    <h2 id={headingID}>Choose an image</h2>
    <button class="close" type="button" aria-label="Close" onclick={() => dialog?.close()}><X size="1.5rem" aria-hidden="true" /></button>
  </div>

  <ImageUploader onfinished={handleFinished} showSettings={false} />

  <div class="library">
    {#if status === "loading"}
      <p class="message">Loading the images…</p>
    {:else if status === "failed"}
      <p class="message failed" role="alert">The image storage couldn't be reached. Try again in a minute.</p>
    {:else if images.length === 0}
      <p class="message">No images yet. Upload one above.</p>
    {:else}
      <ul class="images">
        {#each images as image (image.url)}
          <li>
            <button class="choice" type="button" onclick={() => pick(image)}>
              <span class="thumbnail"><img src={image.url} alt="" loading="lazy" /></span>
              <span class="name">{image.name}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</dialog>

<style>
  .picker {
    width: min(60rem, 100vw - 2rem);
    max-width: none;
    height: min(48rem, 100dvh - 2rem);
    max-height: none;
    padding: var(--space-2) var(--space-3);
    border: var(--rule-section);
    background: var(--paper);
    color: var(--ink);

    &[open] {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      gap: var(--space-2);
    }

    &::backdrop {
      background: color-mix(in oklch, var(--ink) 45%, transparent);
    }
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--space-1);
    border-bottom: var(--rule-row);

    h2 {
      font-size: var(--type-medium);
      font-weight: 900;
    }
  }

  .close {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .library {
    min-height: 0;
    overflow-y: auto;
  }

  .message {
    color: var(--muted);
    font-weight: 600;

    &.failed {
      color: var(--red-text);
    }
  }

  .images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(10rem, 100%), 1fr));
    gap: var(--space-2);
    margin: 0;
    padding: 0.25rem;
    list-style: none;
  }

  .choice {
    display: grid;
    gap: 0.25rem;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
  }

  .thumbnail {
    display: block;
    overflow: hidden;
    aspect-ratio: 4 / 3;
    outline: var(--rule-row);
    background: var(--sunken);
    transition:
      transform var(--duration-quick) var(--ease-out),
      box-shadow var(--duration-quick) var(--ease-out);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: var(--filter-picture);
    }
  }

  .name {
    font-size: var(--type-small);
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .choice:focus-visible {
    outline: none;

    .thumbnail {
      outline: 3px solid var(--red);
      outline-offset: 3px;
    }
  }

  @media (hover: hover) {
    .choice:hover .thumbnail {
      transform: translate(-4px, -4px);
      box-shadow: 4px 4px 0 var(--red);
    }

    .close:hover {
      color: var(--red);
    }
  }
</style>
