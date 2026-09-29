<script lang="ts">
  import type { Project } from "$lib/server/content/cv";

  interface Props {
    projects: Project[];
  }

  let { projects }: Props = $props();
</script>

<ul class="projects">
  {#each projects as project (project.id)}
    <li>
      <div>
        <p class="title">{project.title}</p>
        <p class="description">{project.description}</p>
        <p class="tags">{project.stack.join(" · ")}</p>
      </div>
      <p class="links">
        {#if project.liveURL}
          <a href={project.liveURL} rel="external">{project.liveLabel}</a>
        {/if}
        {#if project.sourceURL}
          <a href={project.sourceURL} rel="external">Source</a>
        {/if}
      </p>
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
      display: grid;
      gap: var(--space-1);
      padding: var(--space-3) 0;
      border-bottom: var(--border-thin) solid var(--colour-divider);

      @media (min-width: 46rem) {
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: var(--space-4);
      }
    }
  }

  .title {
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-4);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .description {
    max-width: 52ch;
    font-size: var(--font-size-2);
  }

  .tags {
    margin-top: var(--space-1);
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
