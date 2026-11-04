<script lang="ts">
  import X from "@lucide/svelte/icons/x";

  interface ViewedImage {
    url: string;
    alt: string;
    caption: string | null;
  }

  let dialog = $state<HTMLDialogElement>();
  let image = $state<ViewedImage | null>(null);

  /** Opens the viewer on an image */
  export function open(viewedImage: ViewedImage): void {
    image = viewedImage;
    dialog?.showModal();
  }

  function close(): void {
    dialog?.close();
  }

  function closeOutsideImage(event: MouseEvent): void {
    if (!(event.target instanceof HTMLImageElement)) close();
  }

  // Keeps Escape away from the page's own Escape handlers, such as the editor's panels
  function keepInside(event: Event): void {
    event.stopPropagation();
  }
</script>

<dialog aria-label="Enlarged image" bind:this={dialog} onclick={closeOutsideImage} onkeydown={keepInside}>
  {#if image}
    <img src={image.url} alt={image.alt} referrerpolicy="no-referrer" />
    {#if image.caption}
      <p>{image.caption}</p>
    {/if}
  {/if}
  <button type="button" aria-label="Close" onclick={close}><X size="1.5rem" aria-hidden="true" /></button>
</dialog>

<style>
  dialog {
    width: 100vw;
    max-width: none;
    height: 100dvh;
    max-height: none;
    margin: 0;
    padding: var(--space-3) var(--space-2) var(--space-2);
    border: 0;
    background: var(--band);
    color: var(--band-ink);

    &[open] {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: var(--space-1);
    }
  }

  img {
    place-self: center;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    filter: var(--filter-picture);
  }

  p {
    color: var(--band-muted);
    font-size: var(--type-small);
    font-weight: 600;
    text-align: center;
  }

  button {
    position: absolute;
    top: var(--space-1);
    right: var(--space-1);
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    background: var(--band);
    color: inherit;
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);
  }

  @media (hover: hover) {
    button:hover {
      color: var(--band-red);
    }
  }
</style>
