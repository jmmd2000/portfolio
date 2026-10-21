<script lang="ts">
  import type { Qualification } from "$lib/server/content/cv";
  import { joinDetails } from "./joinDetails";

  interface Props {
    qualifications: Qualification[];
  }

  let { qualifications }: Props = $props();
</script>

<ul class="qualifications">
  {#each qualifications as qualification (qualification.id)}
    <li>
      <p class="degree">{qualification.degree}</p>
      <p>{joinDetails([qualification.institution, qualification.location])}</p>
      <p class="details">{qualification.startYear} to {qualification.endYear} · {qualification.grade}</p>
    </li>
  {/each}
</ul>

<style>
  .qualifications {
    display: grid;
    gap: var(--old-space-5);
    margin: 0;
    padding: 0;
    list-style: none;

    li {
      break-inside: avoid;
    }
  }

  .degree {
    color: var(--colour-foreground);
    font-weight: 600;
    font-stretch: var(--font-stretch-heading);
    line-height: 1.35;
  }

  .details {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }
</style>
