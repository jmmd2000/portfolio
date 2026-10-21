<script module lang="ts">
  import type { Project } from "$lib/server/content/projects";

  /** Only the fields the project shows, so the admin preview can pass what's typed before it's saved */
  export type ProjectDetailFields = Pick<Project, "id" | "title" | "description" | "imageURL" | "liveURL" | "liveLabel" | "sourceURL" | "stack" | "year">;

  const stackList = new Intl.ListFormat("en-GB", { type: "conjunction" });
</script>

<script lang="ts">
  import { resolve } from "$app/paths";
  import LinkArrow from "$lib/components/links/LinkArrow.svelte";

  interface Props {
    project: ProjectDetailFields;
    headingLevel: "h2" | "h3";
    imageLoading?: "eager" | "lazy";
    /** The slug of the project's published article, if it has one */
    writeUpSlug?: string | null;
  }

  let { project, headingLevel, imageLoading = "lazy", writeUpSlug = null }: Props = $props();

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
  <div>
    {#if project.year !== null}
      <p class="small">{project.year}</p>
    {/if}
    <svelte:element this={headingLevel} class="name">{project.title}</svelte:element>
    <p class="description">{project.description}</p>
    {#if project.stack.length > 0}
      <p class="small stack">Built with {stackList.format(project.stack)}</p>
    {/if}
    {#if project.liveURL || project.sourceURL || writeUpSlug}
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
        {#if writeUpSlug}
          <li>
            <a href={resolve("/(site)/articles/[slug]", { slug: writeUpSlug })}>Read the write-up<span class="visually-hidden"> for {project.title}</span><LinkArrow kind="internal" /></a>
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
    gap: var(--space-4);
    align-items: start;
    padding-block: var(--space-4);
    border-bottom: var(--rule-row);
    scroll-margin-top: var(--space-3);
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
    font-size: var(--type-large);
    font-weight: 900;
    text-align: center;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }

  .small {
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .name {
    margin-top: var(--space-1);
    font-size: var(--type-large);
    font-weight: 900;
    overflow-wrap: anywhere;
  }

  .description {
    max-width: 40ch;
    margin-top: var(--space-2);
  }

  .stack {
    margin-top: var(--space-2);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin: var(--space-3) 0 0;
    padding: 0;
    list-style: none;

    a {
      display: inline-block;
      padding-block: var(--space-1);
    }
  }

  /* The screenshot lifts when one of the project's links is in use */
  .project:has(.links a:focus-visible) .shot {
    transform: translate(-6px, -6px);
    box-shadow: 6px 6px 0 var(--red);
  }

  @media (hover: hover) {
    .project:has(.links a:hover) .shot {
      transform: translate(-6px, -6px);
      box-shadow: 6px 6px 0 var(--red);
    }
  }

  @media (max-width: 47.5rem) {
    .project {
      grid-template-columns: minmax(0, 1fr);
      gap: var(--space-3);
    }
  }
</style>
