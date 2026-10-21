<script lang="ts">
  import type { Job } from "$lib/server/content/cv";
  import BulletList from "./BulletList.svelte";
  import DotList from "./DotList.svelte";
  import { formatDateRange } from "./dateRange";

  interface Props {
    job: Job;
  }

  let { job }: Props = $props();

  let logoFailed = $state(false);
</script>

<article class="job" id="job-{job.id}">
  <div class="heading">
    <span class="logo">
      {#if logoFailed}
        <span class="fallback" aria-hidden="true">{job.company.charAt(0)}</span>
      {:else}
        <img src={job.logoURL} alt="{job.company} logo" width="96" height="96" onerror={() => (logoFailed = true)} />
      {/if}
    </span>
    <div class="summary">
      <h3 class="title">{job.title}</h3>
      <span class="period">{formatDateRange(job.startDate, job.endDate)}</span>
      <span class="place">
        {#if job.companyURL}
          <a class="company" href={job.companyURL} rel="external">{job.company}</a>{:else}<span class="company">{job.company}</span>{/if}{#if job.location}, {job.location}{/if}
      </span>
    </div>
  </div>
  <BulletList items={job.bullets} />
  {#if job.tags.length > 0}
    <p class="tags"><DotList items={job.tags} /></p>
  {/if}
</article>

<style>
  .job {
    max-width: 52rem;
    break-inside: avoid;
    scroll-margin-top: var(--old-space-6);
  }

  .heading {
    display: grid;
    grid-template-columns: 3rem minmax(0, 1fr);
    align-items: center;
    gap: var(--old-space-4);
  }

  /* Logos are made for white, so they sit on a light tile in both themes */
  .logo {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    padding: var(--old-space-1);
    border-radius: var(--radius-medium);
    background: oklch(0.99 0.004 var(--hue));
    box-shadow: 0 0 0 1px color-mix(in oklch, var(--colour-text) 10%, transparent);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .fallback {
    color: oklch(0.2 0.012 var(--hue));
    font-weight: 600;
  }

  .summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0 var(--old-space-4);
  }

  .title {
    font-size: var(--font-size-title);
    font-weight: 600;
    line-height: 1.3;
  }

  .period {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
    white-space: nowrap;
  }

  .place {
    grid-column: 1 / -1;
  }

  .company {
    color: var(--colour-foreground);
    font-weight: 500;
  }

  .tags {
    margin-top: var(--old-space-3);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  @media (max-width: 36rem) {
    .summary {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media print {
    .tags {
      margin-top: var(--old-space-2);
    }

    .company {
      text-decoration: none;
    }
  }
</style>
