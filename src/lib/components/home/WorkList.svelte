<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Job } from "$lib/server/content/cv";
  import { formatWorkYears, yearOf } from "./workYears";

  interface Props {
    jobs: Job[];
  }

  let { jobs }: Props = $props();
</script>

<ul class="work">
  {#each jobs as job (job.id)}
    <li>
      <a href="{resolve('/cv')}#job-{job.id}">{job.company}</a>
      <span class="years">{formatWorkYears(yearOf(job.startDate), job.endDate === null ? null : yearOf(job.endDate))}</span>
      <span class="role">{job.title}</span>
    </li>
  {/each}
</ul>

<style>
  .work {
    display: grid;
    gap: var(--space-4);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-1) var(--space-4);
  }

  a {
    font-weight: 560;
    text-decoration: underline;
    text-decoration-color: color-mix(in oklch, var(--colour-accent) 80%, transparent);
    transition: text-decoration-color var(--duration-quick) var(--ease-out);
  }

  .years {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  .role {
    grid-column: 1 / -1;
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
    line-height: 1.4;
  }

  @media (hover: hover) {
    a:hover {
      text-decoration-color: var(--colour-accent);
    }
  }

  @media (hover: none) {
    a {
      justify-self: start;
      margin-block: calc(-1 * var(--space-3));
      padding-block: var(--space-3);
    }
  }
</style>
