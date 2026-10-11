<script lang="ts">
  import { linkText } from "$lib/components/contact/linkText";
  import ExternalArrow from "$lib/components/links/ExternalArrow.svelte";
  import type { Project } from "$lib/server/content/projects";
  import BulletList from "./BulletList.svelte";
  import DotList from "./DotList.svelte";

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();
</script>

<ul class="projects">
  {#each projects as project (project.id)}
    <li>
      <div class="heading">
        <h3 class="title">
          {project.title}
          {#if project.year}
            <span class="year">{project.year}</span>
          {/if}
        </h3>
        {#if project.liveURL || project.sourceURL}
          <ul class="links">
            {#if project.liveURL}
              <li>
                <a href={project.liveURL} rel="external">
                  <span class="label">{project.liveLabel}</span><span class="address">{linkText(project.liveURL)}</span><span class="visually-hidden"> for {project.title}</span><ExternalArrow />
                </a>
              </li>
            {/if}
            {#if project.sourceURL}
              <li>
                <a href={project.sourceURL} rel="external">
                  <span class="label">Source</span><span class="address">{linkText(project.sourceURL)}</span><span class="visually-hidden"> for {project.title}</span><ExternalArrow />
                </a>
              </li>
            {/if}
          </ul>
        {/if}
      </div>
      {#if project.highlights.length > 0}
        <BulletList items={project.highlights} />
      {:else}
        <p class="description">{project.description}</p>
      {/if}
      {#if project.stack.length > 0}
        <p class="tags"><DotList items={project.stack} /></p>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .projects {
    display: grid;
    gap: var(--space-7);
    margin: 0;
    padding: 0;
    list-style: none;

    > li {
      max-width: 52rem;
      break-inside: avoid;
    }
  }

  .heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-2) var(--space-5);
  }

  .title {
    font-size: var(--font-size-title);
    font-weight: 600;
    line-height: 1.3;
  }

  .year {
    margin-inline-start: var(--space-2);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
    font-weight: 500;
    font-stretch: 100%;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    margin: 0;
    padding: 0;
    font-size: var(--font-size-label);
    list-style: none;

    a {
      font-weight: 500;
    }
  }

  .address {
    display: none;
  }

  .description {
    max-width: 64ch;
    margin-top: var(--space-4);
  }

  .tags {
    margin-top: var(--space-3);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  @media (hover: none) {
    .links a {
      display: inline-block;
      margin-block: calc(-1 * var(--space-3));
      padding-block: var(--space-3);
    }
  }

  @media print {
    .projects {
      gap: var(--space-4);
    }

    .links a {
      text-decoration: none;
    }

    .label {
      display: none;
    }

    .address {
      display: inline;
    }
  }
</style>
