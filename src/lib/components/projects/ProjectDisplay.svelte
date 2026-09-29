<script lang="ts">
  import type { Project } from "$lib/server/content/projects";

  interface Props {
    project: Project;
    index: number;
    headingLevel: "h2" | "h3";
  }

  let { project, index, headingLevel }: Props = $props();

  const stageColours = ["foreground", "orange", "teal", "panel"] as const;
  const stageColour = $derived(stageColours[index % stageColours.length]);
  const flipped = $derived(index % 2 === 1);
</script>

<article class="card stage-{stageColour}" class:flipped>
  <div class="words">
    <svelte:element this={headingLevel} class="name">{project.title}</svelte:element>
    <p class="line">{project.description}</p>
    <p class="links">
      {#if project.liveURL}
        <a href={project.liveURL} rel="external">{project.liveLabel} <span aria-hidden="true">↗</span></a>
      {/if}
      {#if project.sourceURL}
        <a href={project.sourceURL} rel="external">Source <span aria-hidden="true">↗</span></a>
      {/if}
    </p>
  </div>
  <div class="stage">
    <img src={project.imageURL} alt="Screenshot of {project.title}" width="1600" height="1000" loading={index === 0 ? "eager" : "lazy"} />
  </div>
</article>

<style>
  .card {
    display: grid;
    border: var(--border-thick) solid var(--colour-foreground);

    @media (min-width: 52rem) {
      grid-template-columns: 1fr 1.3fr;

      &.flipped {
        grid-template-columns: 1.3fr 1fr;

        .stage {
          order: -1;
        }
      }
    }
  }

  .words {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--space-2);
    padding: calc(var(--space-panel) * 1.5) var(--space-panel);
  }

  .name {
    font-size: clamp(1.75rem, 3.5vw, 2.5rem);
    font-weight: 800;
    font-stretch: 88%;
    letter-spacing: -0.04em;
  }

  .line {
    max-width: 40ch;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-1);
    font-size: var(--font-size-2);
    font-weight: 600;

    a {
      border-bottom: var(--border-thick) solid transparent;
      color: var(--colour-teal);
      text-decoration: none;
      transition: border-color var(--duration-quick) var(--ease-out);

      &:hover {
        border-bottom-color: currentColor;
      }
    }
  }

  .stage {
    display: grid;
    place-items: center;
    padding: clamp(var(--space-4), 4vw, var(--space-6));
    border-top: var(--border-thick) solid var(--colour-foreground);

    @media (min-width: 52rem) {
      border-top: none;
      border-left: var(--border-thick) solid var(--colour-foreground);

      .flipped & {
        border-right: var(--border-thick) solid var(--colour-foreground);
        border-left: none;
      }
    }

    img {
      width: 100%;
      height: auto;
      outline: var(--border-thin) solid color-mix(in oklch, var(--colour-foreground) 18%, transparent);
    }
  }

  .stage-foreground .stage {
    background: var(--colour-foreground);
  }

  .stage-orange .stage {
    background: var(--colour-orange);
  }

  .stage-teal .stage {
    background: var(--colour-teal);
  }

  .stage-panel .stage {
    background: var(--colour-panel);
  }
</style>
