<script module lang="ts">
  import type { Project } from "$lib/server/content/projects";

  /** Only the fields the project shows, so the admin preview can pass what's typed before it's saved */
  export type ProjectDetailFields = Pick<Project, "id" | "title" | "description" | "imageURL" | "liveURL" | "liveLabel" | "sourceURL" | "stack">;

  const stackList = new Intl.ListFormat("en-GB", { type: "conjunction" });
</script>

<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  interface Props {
    project: ProjectDetailFields;
    headingLevel: "h2" | "h3";
    imageLoading?: "eager" | "lazy";
  }

  let { project, headingLevel, imageLoading = "lazy" }: Props = $props();

  let imageFailed = $state(false);
</script>

<article class="project" id="project-{project.id}">
  <span class="shot">
    {#if imageFailed}
      <span class="fallback" aria-hidden="true">{project.title}</span>
    {:else}
      <img src={project.imageURL} alt="Screenshot of {project.title}" width="1600" height="1000" loading={imageLoading} onerror={() => (imageFailed = true)} />
    {/if}
  </span>
  <div class="words">
    <svelte:element this={headingLevel} class="name">{project.title}</svelte:element>
    <p class="description">{project.description}</p>
    {#if project.stack.length > 0}
      <p class="stack">Built with {stackList.format(project.stack)}</p>
    {/if}
    {#if project.liveURL || project.sourceURL}
      <ul class="links">
        {#if project.liveURL}
          <li>
            <a href={project.liveURL} rel="external"
              >{project.liveLabel}<span class="visually-hidden"> for {project.title}</span><span class="arrow" aria-hidden="true"><ArrowUpRight size="1em" strokeWidth={2} /></span></a
            >
          </li>
        {/if}
        {#if project.sourceURL}
          <li>
            <a href={project.sourceURL} rel="external"
              >Source<span class="visually-hidden"> for {project.title}</span><span class="arrow" aria-hidden="true"><ArrowUpRight size="1em" strokeWidth={2} /></span></a
            >
          </li>
        {/if}
      </ul>
    {/if}
  </div>
</article>

<style>
  .project {
    display: grid;
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
    align-items: center;
    gap: var(--space-7);
    scroll-margin-top: var(--space-6);
  }

  .shot {
    display: grid;
    overflow: hidden;
    aspect-ratio: 16 / 10;
    border-radius: var(--radius-medium);
    background: var(--colour-tint);
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
    padding: var(--space-4);
    color: var(--colour-foreground);
    font-size: var(--font-size-title);
    font-weight: 600;
    text-align: center;
  }

  .name {
    font-size: var(--font-size-heading);
    font-weight: 620;
  }

  .description {
    max-width: 60ch;
    margin-top: var(--space-2);
    font-size: var(--font-size-summary);
    line-height: 1.5;
  }

  .stack {
    margin-top: var(--space-5);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    margin: var(--space-5) 0 0;
    padding: 0;
    font-size: var(--font-size-label);
    list-style: none;

    a {
      font-weight: 500;
    }
  }

  /* A margin instead of a space, so the link's underline stops at the text */
  .arrow {
    display: inline-block;
    margin-inline-start: 0.25em;
    vertical-align: -0.125em;
    color: var(--colour-text-muted);
    transition:
      transform 250ms var(--ease-out),
      color 250ms var(--ease-out);
  }

  /* The picture lifts when one of the project's links is in use */
  .project:has(.links a:focus-visible) .shot {
    transform: translateY(-4px);
    box-shadow:
      0 1px 2px oklch(0.2 0.02 var(--hue) / 0.08),
      var(--shadow-picture-lifted);
  }

  .links a:focus-visible .arrow {
    transform: translate(2px, -2px);
    color: var(--colour-accent);
  }

  @media (hover: hover) {
    .project:has(.links a:hover) .shot {
      transform: translateY(-4px);
      box-shadow:
        0 1px 2px oklch(0.2 0.02 var(--hue) / 0.08),
        var(--shadow-picture-lifted);
    }

    .links a:hover .arrow {
      transform: translate(2px, -2px);
      color: var(--colour-accent);
    }
  }

  @media (hover: none) {
    .links a {
      display: inline-block;
      padding-block: var(--space-2);
    }
  }

  @media (max-width: 52rem) {
    .project {
      grid-template-columns: minmax(0, 1fr);
      align-items: start;
      gap: var(--space-5);
    }
  }
</style>
