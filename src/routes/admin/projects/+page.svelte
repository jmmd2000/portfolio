<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import MoveButtons from "$lib/components/admin/MoveButtons.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<AdminPage title="Projects" description="Edit the projects.">
  <ol class="projects">
    {#each data.projects as project, index (project.id)}
      <li>
        <img src={project.imageURL} alt="" width="160" height="100" />
        <div>
          <a class="name" href={resolve("/admin/projects/[id]", { id: String(project.id) })}>{project.title}</a>
          <p class="tags">
            {#if project.published}
              <span class="tag published">Published</span>
            {:else}
              <span class="tag draft">Not published</span>
            {/if}
            {#if project.featured}
              <span class="tag">Featured</span>
            {/if}
            {#if project.showOnCV}
              <span class="tag">On the CV</span>
            {/if}
          </p>
        </div>
        <form method="POST" action="?/move" use:enhance>
          <input type="hidden" name="id" value={project.id} />
          <MoveButtons formaction="?/move" first={index === 0} last={index === data.projects.length - 1} />
        </form>
      </li>
    {/each}
  </ol>

  <ItemForm action="?/add" legend="Add a project">
    <Field label="Name" name="title" value={form?.values?.title ?? ""} error={form?.errors?.title?.[0]} />
    <Field label="One-liner" name="description" value={form?.values?.description ?? ""} error={form?.errors?.description?.[0]} />
    <div class="wide">
      <Field label="Screenshot URL" name="imageURL" placeholder="https://assets.jamesmddoyle.com/..." value={form?.values?.imageURL ?? ""} error={form?.errors?.imageURL?.[0]} />
    </div>

    {#snippet actions()}
      <Button type="submit" variant="primary">Add</Button>
    {/snippet}
  </ItemForm>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  .projects {
    display: grid;
    width: 100%;
    margin: 0;
    padding: 0;
    border-top: var(--border-thick) solid var(--colour-foreground);
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 4.5rem 1fr auto;
    align-items: center;
    gap: var(--space-3);
    padding-block: var(--space-3);
    border-bottom: var(--border-thin) solid var(--colour-divider);

    @media (max-width: 40rem) {
      grid-template-columns: 4.5rem 1fr;

      form {
        grid-column: 1 / -1;
      }
    }
  }

  img {
    width: 4.5rem;
    height: auto;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    outline: var(--border-thin) solid var(--colour-divider);
  }

  .name {
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-5);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    margin-top: 0.25rem;
  }

  .tag {
    padding: 0 0.5rem;
    border: var(--border-thin) solid var(--colour-foreground);
    color: var(--colour-foreground);
    font-size: var(--font-size-1);
    font-weight: 600;
  }

  .published {
    border-color: var(--colour-teal);
    background: var(--colour-teal);
    color: var(--colour-text-on-teal);
  }

  .draft {
    border-style: dashed;
    border-color: var(--colour-text-muted);
    color: var(--colour-text-muted);
  }

  form {
    display: flex;
    gap: var(--space-2);
  }

  .wide {
    grid-column: 1 / -1;
  }
</style>
