<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Project } from "$lib/server/content/projects";

  interface Props {
    project: Pick<Project, "id" | "title" | "description" | "imageURL">;
  }

  let { project }: Props = $props();

  let imageFailed = $state(false);
</script>

<a class="row" href="{resolve('/projects')}#project-{project.id}">
  <span class="shot">
    {#if imageFailed}
      <span class="fallback" aria-hidden="true">{project.title}</span>
    {:else}
      <img src={project.imageURL} alt="" width="1600" height="1000" loading="lazy" onerror={() => (imageFailed = true)} />
    {/if}
  </span>
  <div>
    <h3>{project.title}</h3>
    <p>{project.description}</p>
  </div>
</a>

<style>
  .row {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: var(--space-4);
    align-items: center;
    padding-block: var(--space-4);
    border-bottom: var(--rule-row);
    text-decoration: none;
  }

  .shot {
    display: grid;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    outline: var(--rule-row);
    transition:
      transform 250ms var(--ease-out),
      box-shadow 250ms var(--ease-out);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top left;
      filter: var(--filter-picture);
    }
  }

  .fallback {
    display: grid;
    place-items: center;
    padding: var(--space-2);
    background: var(--ink);
    color: var(--paper);
    font-family: var(--font-display);
    font-size: var(--type-medium);
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  h3 {
    font-size: var(--type-large);
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  p {
    max-width: 40ch;
    margin-top: var(--space-2);
  }

  .row:focus-visible .shot {
    box-shadow: 6px 6px 0 var(--red);
  }

  @media (hover: hover) {
    .row:hover .shot {
      transform: translate(-6px, -6px);
      box-shadow: 6px 6px 0 var(--red);
    }
  }

  @media (max-width: 47.5rem) {
    .row {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-2);
    }
  }
</style>
