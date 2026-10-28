<script lang="ts">
  import JobEntry from "$lib/components/cv/JobEntry.svelte";
  import Masthead from "$lib/components/cv/Masthead.svelte";
  import ProjectList from "$lib/components/cv/ProjectList.svelte";
  import QualificationList from "$lib/components/cv/QualificationList.svelte";
  import SkillList from "$lib/components/cv/SkillList.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import PersonStructuredData from "$lib/components/head/PersonStructuredData.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="CV" description="The CV of James Doyle, a software engineer and Test Lead at Ericsson." />
<PersonStructuredData profile={data.profile} socials={data.socials} />

<Masthead profile={data.profile} socials={data.socials} />

<section class="cv-section" aria-labelledby="experience-heading">
  <h2 class="section-title" id="experience-heading">Experience</h2>
  <div class="entries">
    {#each data.jobs as job (job.id)}
      <JobEntry {job} />
    {/each}
  </div>
</section>

<section class="cv-section" aria-labelledby="skills-heading">
  <h2 class="section-title" id="skills-heading">Skills</h2>
  <SkillList skillCategories={data.skillCategories} />
</section>

<section class="cv-section" id="education" aria-labelledby="education-heading">
  <h2 class="section-title" id="education-heading">Education</h2>
  <QualificationList qualifications={data.qualifications} />
</section>

{#if data.projects.length > 0}
  <section class="cv-section" aria-labelledby="projects-heading">
    <h2 class="section-title" id="projects-heading">Projects</h2>
    <ProjectList projects={data.projects} />
  </section>
{/if}

<style>
  .cv-section {
    padding: var(--space-3) var(--page-padding) var(--space-5);
    border-bottom: var(--rule-section);
    scroll-margin-top: var(--space-3);
  }

  h2 {
    break-after: avoid;
  }

  .entries > :global(* + *) {
    border-top: var(--rule-row);
  }

  @media print {
    .cv-section {
      padding: var(--space-2) 0;
      border-bottom-width: 2px;
    }

    .entries > :global(* + *) {
      border-top-width: 1px;
    }
  }
</style>
