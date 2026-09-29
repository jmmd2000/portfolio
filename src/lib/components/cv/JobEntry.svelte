<script lang="ts">
  import type { Job } from "$lib/server/content/cv";
  import { formatDateRange } from "./dateRange";

  interface Props {
    job: Job;
  }

  let { job }: Props = $props();
</script>

<article class="job">
  <div class="heading">
    <div class="who">
      <img class="logo" src={job.logoURL} alt="{job.company} logo" width="96" height="96" />
      <p><span class="title">{job.title}</span> <span class="company">{job.company}</span></p>
    </div>
    <p class="period">{formatDateRange(job.startDate, job.endDate)}</p>
  </div>
  <ul class="bullets">
    {#each job.bullets as bullet (bullet)}
      <li>{bullet}</li>
    {/each}
  </ul>
  <p class="tags">{job.tags.join(" · ")}</p>
</article>

<style>
  .job {
    padding: var(--space-4) 0;
    border-bottom: var(--border-thin) solid var(--colour-divider);
  }

  .heading {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
  }

  .who {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .logo {
    flex: none;
    width: 2.25rem;
    height: 2.25rem;
    object-fit: contain;
  }

  .title {
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-4);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .company {
    font-size: var(--font-size-2);
  }

  .period {
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
    white-space: nowrap;
  }

  .bullets {
    display: grid;
    gap: var(--space-1);
    margin: var(--space-2) 0 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      max-width: 64ch;
      padding-left: var(--space-3);
      font-size: var(--font-size-2);

      &::before {
        content: "";
        position: absolute;
        top: 0.6em;
        left: 0;
        width: 6px;
        height: 6px;
        background: var(--colour-orange);
      }
    }
  }

  .tags {
    margin-top: var(--space-2);
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
  }
</style>
