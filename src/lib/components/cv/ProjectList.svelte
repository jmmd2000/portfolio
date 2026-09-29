<script lang="ts">
  import type { Project } from "$lib/server/content/cv";
  import BulletList from "./BulletList.svelte";

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();
</script>

<ul class="projects">
  {#each projects as project (project.id)}
    <li>
      <div class="heading">
        <p>
          <span class="title">{project.title}</span>
          {#if project.year}
            <span class="year">{project.year}</span>
          {/if}
        </p>
        <p class="links">
          {#if project.liveURL}
            <a href={project.liveURL} rel="external">{project.liveLabel}</a>
          {/if}
          {#if project.sourceURL}
            <a href={project.sourceURL} rel="external">Source</a>
          {/if}
        </p>
      </div>
      {#if project.highlights.length > 0}
        <BulletList items={project.highlights} />
      {:else}
        <p class="description">{project.description}</p>
      {/if}
      <p class="tags">{project.stack.join(" · ")}</p>
    </li>
  {/each}
</ul>

<style>
  .projects {
    margin: 0;
    padding: 0;
    border-top: var(--border-thick) solid var(--colour-foreground);
    list-style: none;

    li {
      padding: var(--space-4) 0;
      border-bottom: var(--border-thin) solid var(--colour-divider);
    }
  }

  .heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-3);
  }

  .title {
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-4);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .year {
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
  }

  .description {
    max-width: 52ch;
    margin-top: var(--space-2);
    font-size: var(--font-size-2);
  }

  .tags {
    margin-top: var(--space-2);
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
  }

  .links {
    display: flex;
    gap: var(--space-3);
    font-size: var(--font-size-2);

    a {
      border-bottom: var(--border-thick) solid transparent;
      color: var(--colour-teal);
      font-weight: 600;
      text-decoration: none;
      transition: border-color var(--duration-quick) var(--ease-out);

      &:hover {
        border-bottom-color: var(--colour-teal);
      }
    }
  }
</style>
