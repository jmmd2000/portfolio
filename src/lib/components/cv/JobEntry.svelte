<script lang="ts">
  import type { Job } from "$lib/server/content/cv";
  import BulletList from "./BulletList.svelte";
  import { formatDateRange } from "./dateRange";

  interface Props {
    job: Job;
  }

  let { job }: Props = $props();
</script>

<article class="job">
  <div class="heading">
    <img class="logo" src={job.logoURL} alt="{job.company} logo" width="96" height="96" />
    <div class="summary">
      <p class="title">{job.title}</p>
      <p class="location">
        {#if job.companyURL}
          <a class="company" href={job.companyURL} rel="external">{job.company}</a>
        {:else}
          <span>{job.company}</span>
        {/if}
        {#if job.location}
          <span>· {job.location}</span>
        {/if}
      </p>
      <p class="period">{formatDateRange(job.startDate, job.endDate)}</p>
    </div>
  </div>
  <BulletList items={job.bullets} />
  <p class="tags">{job.tags.join(" · ")}</p>
</article>

<style>
  .job {
    padding: var(--space-4) 0;
    border-bottom: var(--border-thin) solid var(--colour-divider);
    break-inside: avoid;
  }

  .heading {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .summary {
    flex: 1;

    @media (min-width: 36rem) {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: baseline;
      column-gap: var(--space-3);

      .location {
        grid-column: 1 / -1;
      }

      .period {
        grid-row: 1;
        grid-column: 2;
      }
    }
  }

  .logo {
    flex: none;
    width: 2.5rem;
    height: 2.5rem;
    object-fit: contain;
  }

  .title {
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-4);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .location {
    font-size: var(--font-size-2);
  }

  .company {
    border-bottom: var(--border-thin) solid var(--colour-divider);
    color: inherit;
    text-decoration: none;
    transition: border-color var(--duration-quick) var(--ease-out);

    &:hover {
      border-bottom-color: var(--colour-text);
    }

    @media print {
      border-bottom: none;
    }
  }

  .period {
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
    white-space: nowrap;
  }

  .tags {
    margin-top: var(--space-2);
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
  }
</style>
