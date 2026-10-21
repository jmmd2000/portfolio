<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import { articleSlugFrom } from "$lib/schemas/article";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  // Both reset to what was typed when a failed add shows the form again
  let title = $derived(form?.values?.title ?? "");
  let slug = $derived(form?.values?.slug ?? "");

  type FieldInputEvent = Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement };

  /** The slug follows the title while it's empty or still made from the title, so a slug typed by hand stays */
  function handleTitleInput(event: FieldInputEvent): void {
    const newTitle = event.currentTarget.value;
    if (slug === "" || slug === articleSlugFrom(title)) slug = articleSlugFrom(newTitle);
    title = newTitle;
  }

  function handleSlugInput(event: FieldInputEvent): void {
    slug = event.currentTarget.value;
  }
</script>

<AdminPage title="Articles" description="Edit the articles.">
  {#if data.articles.length > 0}
    <ol class="articles">
      {#each data.articles as article (article.id)}
        <li>
          <a class="name" href={resolve("/(editor)/admin/articles/[id]", { id: String(article.id) })}>{article.title}</a>
          <p class="status" class:draft={!article.published}>{article.status}</p>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="empty">No articles yet.</p>
  {/if}

  <ItemForm action="?/add" legend="Add an article">
    <Field label="Title" name="title" value={title} oninput={handleTitleInput} error={form?.errors?.title?.[0]} />
    <Field label="Slug" name="slug" hint="The end of its address, like my-first-article" value={slug} oninput={handleSlugInput} error={form?.errors?.slug?.[0]} />
    <div class="wide">
      <Field label="Summary" name="summary" value={form?.values?.summary ?? ""} error={form?.errors?.summary?.[0]} />
    </div>

    {#snippet actions()}
      <Button type="submit" variant="primary">Add</Button>
    {/snippet}
  </ItemForm>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  .articles {
    display: grid;
    width: 100%;
    max-width: 48rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding-block: var(--old-space-3);
    border-bottom: 1px solid var(--colour-divider);
  }

  .name {
    font-size: var(--font-size-title);
    font-weight: 600;
    text-decoration-color: transparent;
    transition: text-decoration-color var(--duration-quick) var(--ease-out);

    &:focus-visible {
      text-decoration-color: var(--colour-accent);
    }
  }

  .status {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  .draft {
    font-style: italic;
  }

  .empty {
    color: var(--colour-text-muted);
  }

  .wide {
    grid-column: 1 / -1;
  }

  @media (hover: hover) {
    .name:hover {
      text-decoration-color: var(--colour-accent);
    }
  }
</style>
