<script lang="ts">
  import { resolve } from "$app/paths";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import type { Project } from "$lib/server/content/projects";

  interface Props {
    project: Pick<Project, "id" | "title" | "description" | "imageURL">;
    headingLevel: "h2" | "h3";
  }

  let { project, headingLevel }: Props = $props();

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
  <svelte:element this={headingLevel} class="name">{project.title} <span class="arrow" aria-hidden="true"><ArrowRight size="1em" strokeWidth={2} /></span></svelte:element>
  <p class="description">{project.description}</p>
</a>

<style>
  .row {
    display: grid;
    align-content: start;
    border-radius: var(--radius-large);
    color: var(--colour-text);
    text-decoration: none;
  }

  .shot {
    display: grid;
    overflow: hidden;
    margin-bottom: var(--old-space-4);
    aspect-ratio: 16 / 10;
    border-radius: var(--radius-medium);
    background: var(--colour-background);
    box-shadow:
      0 1px 2px oklch(0.2 0.02 var(--hue) / 0.08),
      var(--shadow-picture);
    transition:
      transform var(--duration-lift) var(--ease-out),
      box-shadow var(--duration-lift) var(--ease-out);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top left;
      filter: var(--filter-picture);
    }
  }

  .fallback {
    place-self: center;
    padding: var(--old-space-3);
    color: var(--colour-foreground);
    font-weight: 600;
    text-align: center;
  }

  .name {
    margin-bottom: var(--old-space-1);
    font-size: var(--font-size-title);
    line-height: 1.3;
  }

  .arrow {
    display: inline-block;
    vertical-align: -0.125em;
    color: var(--colour-text-muted);
    transition:
      transform 250ms var(--ease-out),
      color 250ms var(--ease-out);
  }

  .row:focus-visible {
    .shot {
      transform: translateY(-4px);
    }

    .arrow {
      transform: translateX(3px);
      color: var(--colour-accent);
    }
  }

  @media (hover: hover) {
    .row:hover {
      .shot {
        transform: translateY(-4px);
        box-shadow:
          0 1px 2px oklch(0.2 0.02 var(--hue) / 0.08),
          var(--shadow-picture-lifted);
      }

      .arrow {
        transform: translateX(3px);
        color: var(--colour-accent);
      }
    }
  }

  @media (max-width: 52rem) {
    .shot {
      margin-bottom: var(--old-space-3);
    }

    .name {
      font-size: var(--font-size-summary);
    }
  }
</style>
