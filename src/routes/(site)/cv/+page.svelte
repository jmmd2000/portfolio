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

<section aria-labelledby="experience-heading">
  <h2 id="experience-heading">Experience</h2>
  <div class="jobs">
    {#each data.jobs as job (job.id)}
      <JobEntry {job} />
    {/each}
  </div>
</section>

<div class="two-columns">
  <section aria-labelledby="skills-heading">
    <h2 id="skills-heading">Skills</h2>
    <SkillList skillCategories={data.skillCategories} />
  </section>
  <section id="education" aria-labelledby="education-heading">
    <h2 id="education-heading">Education</h2>
    <QualificationList qualifications={data.qualifications} />
  </section>
</div>

{#if data.projects.length > 0}
  <section aria-labelledby="projects-heading">
    <h2 id="projects-heading">Projects</h2>
    <ProjectList projects={data.projects} />
  </section>
{/if}

<style>
  section,
  .two-columns {
    margin-top: var(--space-8);
  }

  h2 {
    margin-bottom: var(--space-5);
    break-after: avoid;
    scroll-margin-top: var(--space-6);
  }

  .jobs {
    display: grid;
    gap: var(--space-7);
  }

  .two-columns {
    display: grid;
    gap: var(--space-8);
    break-inside: avoid;

    section {
      margin-top: 0;
    }

    @media (min-width: 44rem) {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-7);
    }
  }

  @media (max-width: 52rem) {
    section,
    .two-columns {
      margin-top: var(--space-7);
    }
  }

  /* Print uses tighter spacing, so the CV takes fewer pages */
  @media print {
    section,
    .two-columns {
      margin-top: var(--space-5);
    }

    h2 {
      margin-bottom: var(--space-3);
      font-size: var(--font-size-title);
    }

    .jobs {
      gap: var(--space-4);
    }

    .two-columns {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-5);
    }
  }
</style>
