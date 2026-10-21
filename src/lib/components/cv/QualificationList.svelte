<script lang="ts">
  import type { Qualification } from "$lib/server/content/cv";
  import CVEntry from "./CVEntry.svelte";

  interface Props {
    qualifications: Qualification[];
  }

  let { qualifications }: Props = $props();
</script>

<div class="entries">
  {#each qualifications as qualification (qualification.id)}
    <CVEntry period="{qualification.startYear} to {qualification.endYear}" place={qualification.location}>
      <h3>{qualification.degree}</h3>
      <p class="where">{qualification.institution}</p>
      <p class="grade">{qualification.grade}</p>
    </CVEntry>
  {/each}
</div>

<style>
  .entries > :global(* + *) {
    border-top: var(--rule-row);
  }

  h3 {
    font-size: var(--type-medium);
    font-weight: 900;
  }

  .where {
    margin-top: 0.25rem;
    font-weight: 700;
  }

  .grade {
    margin-top: var(--space-1);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }
</style>
