<script lang="ts">
  import type { Job } from "$lib/server/content/cv";
  import BulletList from "./BulletList.svelte";
  import CVEntry from "./CVEntry.svelte";
  import DotList from "./DotList.svelte";
  import { formatDateRange } from "./dateRange";

  interface Props {
    job: Job;
  }

  let { job }: Props = $props();

  let logoFailed = $state(false);
</script>

<CVEntry period={formatDateRange(job.startDate, job.endDate)} place={job.location}>
  {#snippet logo()}
    <span class="logo">
      {#if logoFailed}
        <span class="fallback" aria-hidden="true">{job.company.charAt(0)}</span>
      {:else}
        <img src={job.logoURL} alt="{job.company} logo" width="96" height="96" onerror={() => (logoFailed = true)} />
      {/if}
    </span>
  {/snippet}
  <h3>{job.title}</h3>
  <p class="where">
    {#if job.companyURL}
      <a href={job.companyURL} rel="external">{job.company}</a>
    {:else}
      {job.company}
    {/if}
  </p>
  <BulletList items={job.bullets} />
  {#if job.tags.length > 0}
    <p class="tags"><DotList items={job.tags} /></p>
  {/if}
</CVEntry>

<style>
  /* Logos are made for a white background, so they sit on a light tile in both themes */
  .logo {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    margin-bottom: var(--space-1);
    padding: 0.25rem;
    background: oklch(0.99 0.004 80);
    outline: 1px solid var(--line);

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .fallback {
    color: oklch(0.16 0.01 40);
    font-family: var(--font-display);
    font-size: var(--type-label);
    font-weight: 900;
  }

  h3 {
    font-size: var(--type-medium);
    font-weight: 900;
  }

  .where {
    margin-top: 0.25rem;
    font-weight: 700;
  }

  .tags {
    margin-top: var(--space-2);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  @media print {
    .tags {
      margin-top: var(--space-1);
    }

    .where a {
      text-decoration: none;
    }
  }
</style>
