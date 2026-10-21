<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import MoveButtons from "$lib/components/admin/MoveButtons.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import type { Project } from "$lib/server/content/projects";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  /** Where a project shows, as one line: "Published · Featured · On the CV", or "Not published" */
  function projectStatus(project: Project): string {
    if (!project.published) return "Not published";

    const places = ["Published"];
    if (project.featured) places.push("Featured");
    if (project.showOnCV) places.push("On the CV");
    return places.join(" · ");
  }
</script>

<AdminPage title="Projects" description="Edit the projects.">
  <ol class="projects">
    {#each data.projects as project, index (project.id)}
      <li>
        <img src={project.imageURL} alt="" width="160" height="100" />
        <div>
          <a class="name" href={resolve("/(admin)/admin/projects/[id]", { id: String(project.id) })}>{project.title}</a>
          <p class="status" class:draft={!project.published}>{projectStatus(project)}</p>
        </div>
        <form method="POST" action="?/move" use:enhance>
          <input type="hidden" name="id" value={project.id} />
          <MoveButtons formaction="?/move" first={index === 0} last={index === data.projects.length - 1} />
        </form>
      </li>
    {/each}
  </ol>

  <ItemForm action="?/add" legend="Add a project" add>
    <Field label="Name" name="title" value={form?.values?.title ?? ""} error={form?.errors?.title?.[0]} />
    <Field label="One-liner" name="description" value={form?.values?.description ?? ""} error={form?.errors?.description?.[0]} />
    <div class="wide">
      <Field label="Screenshot URL" name="imageURL" placeholder="https://assets.jamesmddoyle.com/..." value={form?.values?.imageURL ?? ""} error={form?.errors?.imageURL?.[0]} />
    </div>

    {#snippet actions()}
      <Button type="submit" variant="primary">Add</Button>
    {/snippet}
  </ItemForm>
</AdminPage>

<style>
  .projects {
    display: grid;
    width: 100%;
    max-width: 48rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-2);
    padding-block: var(--space-2);
    border-bottom: 1px solid var(--line);

    > div {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    @media (max-width: 40rem) {
      grid-template-columns: 5rem minmax(0, 1fr);

      form {
        grid-column: 1 / -1;
      }
    }
  }

  img {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    object-position: top left;
    outline: 1px solid var(--ink);
    filter: var(--filter-picture);
  }

  .name {
    font-size: 1.125rem;
    font-weight: 700;
    text-decoration-color: transparent;
    transition: text-decoration-color var(--duration-quick) var(--ease-out);

    &:focus-visible {
      text-decoration-color: var(--red);
    }
  }

  .status {
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .draft {
    color: var(--red-text);
    font-weight: 700;
  }

  @media (hover: hover) {
    .name:hover {
      text-decoration-color: var(--red);
    }
  }

  form {
    display: flex;
    gap: var(--space-1);
  }
</style>
