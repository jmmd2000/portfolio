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
      <p class="institution">{joinDetails([qualification.institution, qualification.location])}</p>
      <p class="details">{qualification.startYear} - {qualification.endYear} · {qualification.grade}</p>
    </li>
  {/each}
</ul>

<style>
  .qualifications {
    margin: 0;
    padding: 0;
    border-top: var(--border-thick) solid var(--colour-foreground);
    list-style: none;

    li {
      padding: var(--space-2) 0;
      border-bottom: var(--border-thin) solid var(--colour-divider);
      break-inside: avoid;
    }
  }

  .degree {
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .institution {
    font-size: var(--font-size-2);
  }

  .details {
    color: var(--colour-text-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
  }
</style>
