<script lang="ts">
  import JobEntry from "$lib/components/cv/JobEntry.svelte";
  import Masthead from "$lib/components/cv/Masthead.svelte";
  import ProjectList from "$lib/components/cv/ProjectList.svelte";
  import QualificationList from "$lib/components/cv/QualificationList.svelte";
  import SkillList from "$lib/components/cv/SkillList.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<Masthead profile={data.profile} socials={data.socials} />

<section>
  <h2>Experience</h2>
  <div class="jobs">
    {#each data.jobs as job (job.id)}
      <JobEntry {job} />
    {/each}
  </div>
</section>

<section class="two-columns">
  <div>
    <h2>Skills</h2>
    <SkillList skillCategories={data.skillCategories} />
  </div>
  <div>
    <h2>Education</h2>
    <QualificationList qualifications={data.qualifications} />
  </div>
</section>

<section>
  <h2>Projects</h2>
  <ProjectList projects={data.projects} />
</section>

<style>
  section {
    margin-top: clamp(var(--space-7), 8vw, var(--space-8));
  }

  h2 {
    margin-bottom: var(--space-4);
  }

  .jobs {
    border-top: var(--border-thick) solid var(--colour-foreground);
  }

  .two-columns {
    display: grid;
    gap: var(--space-6);

    @media (min-width: 44rem) {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
    }
  }
</style>
