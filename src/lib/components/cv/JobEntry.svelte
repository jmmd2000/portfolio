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
</script>

<CVEntry period={formatDateRange(job.startDate, job.endDate)} place={job.location}>
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
