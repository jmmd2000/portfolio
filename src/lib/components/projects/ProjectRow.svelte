<script lang="ts">
  import { resolve } from "$app/paths";
  import LinkArrow from "$lib/components/links/LinkArrow.svelte";
  import type { Project } from "$lib/server/content/projects";

  interface Props {
    project: Pick<Project, "id" | "title" | "description" | "imageURL" | "liveURL" | "liveLabel" | "sourceURL">;
  }

  let { project }: Props = $props();

  let imageFailed = $state(false);
</script>

<article class="row">
  <span class="shot">
    {#if imageFailed}
      <span class="fallback" aria-hidden="true">{project.title}</span>
    {:else}
      <img src={project.imageURL} alt="" width="1600" height="1000" loading="lazy" onerror={() => (imageFailed = true)} />
    {/if}
  </span>
  <div>
    <h3><a href="{resolve('/projects')}#project-{project.id}">{project.title}</a></h3>
    <p>{project.description}</p>
    {#if project.liveURL || project.sourceURL}
      <ul class="links label">
        {#if project.liveURL}
          <li>
            <a href={project.liveURL} rel="external">{project.liveLabel}<span class="visually-hidden"> for {project.title}</span><LinkArrow kind="external" /></a>
          </li>
        {/if}
        {#if project.sourceURL}
          <li>
            <a href={project.sourceURL} rel="external">Source<span class="visually-hidden"> for {project.title}</span><LinkArrow kind="external" /></a>
          </li>
        {/if}
      </ul>
    {/if}
  </div>
</article>

<style>
  .row {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: var(--space-3);
    align-items: center;
    padding-block: var(--space-3);
    border-bottom: var(--rule-row);
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
    padding: var(--space-1);
    background: var(--ink);
    color: var(--paper);
    font-family: var(--font-display);
    font-size: var(--type-label);
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  h3 {
    font-size: var(--type-medium);
    font-weight: 900;
    overflow-wrap: anywhere;

    a {
      text-decoration-color: transparent;
    }
  }

  p {
    max-width: 52ch;
    margin-top: var(--space-1);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-3);
    margin: var(--space-1) 0 0;
    padding: 0;
    list-style: none;

    a {
      display: inline-block;
      padding-block: var(--space-1);
    }
  }

  /* The screenshot lifts when one of the project's links is in use */
  .row:has(a:focus-visible) .shot {
    transform: translate(-6px, -6px);
    box-shadow: 6px 6px 0 var(--red);
  }

  @media (hover: hover) {
    .row:has(a:hover) .shot {
      transform: translate(-6px, -6px);
      box-shadow: 6px 6px 0 var(--red);
    }

    h3 a:hover {
      text-decoration-color: var(--red);
    }
  }

  @media (max-width: 47.5rem) {
    .row {
      grid-template-columns: 6rem minmax(0, 1fr);
      gap: var(--space-2);
      align-items: start;
    }
  }
</style>
