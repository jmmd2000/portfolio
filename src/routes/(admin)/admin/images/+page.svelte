<script lang="ts">
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import CopyButton from "$lib/components/contact/CopyButton.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import ImageUploader from "$lib/components/images/ImageUploader.svelte";
  import { formatBytes } from "$lib/images/formatBytes";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  const freeStorageBytes = 10_000_000_000;
</script>

<AdminPage title="Images" description="The site's images.">
  {#if form?.message}
    <FormMessage status={form.deleted ? "success" : "error"}>{form.message}</FormMessage>
  {/if}

  {#if data.failed}
    <FormMessage status="error">The image storage couldn't be reached, so the images can't be listed. Try again in a minute.</FormMessage>
  {:else}
    <ImageUploader onuploaded={() => invalidateAll()} dropOnPage />

    <p class="usage">
      <meter min="0" max={freeStorageBytes} value={data.storageUsed} aria-hidden="true"></meter>
      {formatBytes(data.storageUsed)} of the free 10 GB used
    </p>

    {#if data.images.length === 0}
      <p class="empty">No images yet.</p>
    {:else}
      <ul class="images">
        {#each data.images as image (image.name)}
          <li>
            <a class="thumbnail" href={image.url} rel="external">
              <img src={image.url} alt="" loading="lazy" />
              <span class="visually-hidden">Open {image.name}</span>
            </a>
            <p class="name">{image.name}</p>
            <p class="meta">{formatBytes(image.size)} · {image.uploaded}</p>
            {#if image.usedBy.length > 0}
              <p class="meta">Used by {image.usedBy.join(", ")}</p>
            {/if}
            <form class="actions" method="POST" use:enhance>
              <input type="hidden" name="name" value={image.name} />
              <CopyButton text={image.url} label="Copy address" />
              <ConfirmDelete name={image.name} formaction="?/delete" note={image.usedBy.length > 0 ? `Still used by ${image.usedBy.join(", ")}.` : undefined} />
            </form>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</AdminPage>

<style>
  .usage {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    font-size: var(--type-small);
    font-weight: 600;
  }

  meter {
    width: 12rem;
    height: 0.75rem;
  }

  .empty {
    color: var(--muted);
  }

  .images {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(14rem, 100%), 1fr));
    gap: var(--space-3) var(--space-2);
    width: 100%;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    align-content: start;
    gap: 0.25rem;
    min-width: 0;
  }

  .thumbnail {
    display: block;
    overflow: hidden;
    margin-bottom: var(--space-1);
    aspect-ratio: 4 / 3;
    outline: var(--rule-row);
    background: var(--sunken);

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: var(--filter-picture);
    }
  }

  .name {
    font-weight: 700;
    overflow-wrap: anywhere;
  }

  .meta {
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    gap: var(--space-1) var(--space-2);
    margin-top: var(--space-1);
  }
</style>
