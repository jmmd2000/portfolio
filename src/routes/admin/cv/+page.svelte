<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import MoveButtons from "$lib/components/admin/MoveButtons.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import type { Job, Qualification, SkillCategory } from "$lib/server/content/cv";
  import type { PageProps } from "./$types";
  import JobFields from "./JobFields.svelte";
  import QualificationFields from "./QualificationFields.svelte";
  import SkillCategoryFields from "./SkillCategoryFields.svelte";

  let { data, form }: PageProps = $props();

  const jobResult = $derived(form?.list === "jobs" ? form : undefined);
  const addJobResult = $derived(jobResult?.id === "new" ? jobResult : undefined);
  const skillResult = $derived(form?.list === "skills" ? form : undefined);
  const addSkillResult = $derived(skillResult?.id === "new" ? skillResult : undefined);
  const qualificationResult = $derived(form?.list === "qualifications" ? form : undefined);
  const addQualificationResult = $derived(qualificationResult?.id === "new" ? qualificationResult : undefined);

  /** A saved job as the text its form shows */
  function jobValues(job: Job): Record<string, string> {
    return {
      title: job.title,
      company: job.company,
      companyURL: job.companyURL ?? "",
      location: job.location ?? "",
      logoURL: job.logoURL,
      startDate: job.startDate.slice(0, 7),
      endDate: job.endDate?.slice(0, 7) ?? "",
      bullets: job.bullets.join("\n"),
      tags: job.tags.join("\n"),
    };
  }

  /** A saved skill category as the text its form shows */
  function skillValues(category: SkillCategory): Record<string, string> {
    return { category: category.category, items: category.items.join("\n") };
  }

  /** A saved qualification as the text its form shows */
  function qualificationValues(qualification: Qualification): Record<string, string> {
    return {
      degree: qualification.degree,
      institution: qualification.institution,
      location: qualification.location ?? "",
      grade: qualification.grade,
      startYear: String(qualification.startYear),
      endYear: String(qualification.endYear),
    };
  }
</script>

<AdminPage title="CV" description="Edit the CV.">
  <nav class="jump" aria-label="Sections">
    <a href="#jobs">Jobs</a>
    <a href="#skills">Skills</a>
    <a href="#education">Education</a>
  </nav>

  <!-- In each list, only the form that was submitted shows its result: the saved message, or what was typed and what's wrong -->
  <section id="jobs">
    <h2>Jobs</h2>
    <p class="order">Newest first, by date.</p>

    <ol class="items">
      {#each data.jobs as job (job.id)}
        {@const result = jobResult?.id === job.id ? jobResult : undefined}
        <li>
          <ItemForm action="?/updateJob" legend="{job.title} at {job.company}" id={job.id} message={result?.message}>
            <JobFields values={result?.values ?? jobValues(job)} errors={result?.errors} />

            {#snippet actions()}
              <Button type="submit" variant="primary">Save</Button>
              <ConfirmDelete name="{job.title} at {job.company}" formaction="?/deleteJob" />
            {/snippet}
          </ItemForm>
        </li>
      {/each}
    </ol>

    <ItemForm action="?/addJob" legend="Add a job" resetOnSuccess message={addJobResult?.message}>
      <JobFields values={addJobResult?.values ?? {}} errors={addJobResult?.errors} />

      {#snippet actions()}
        <Button type="submit" variant="primary">Add</Button>
      {/snippet}
    </ItemForm>
  </section>

  <section id="skills">
    <h2>Skills</h2>
    <p class="order">In the order shown on the CV.</p>

    <ol class="items">
      {#each data.skillCategories as category, index (category.id)}
        {@const result = skillResult?.id === category.id ? skillResult : undefined}
        <li>
          <ItemForm action="?/updateSkillCategory" legend={category.category} id={category.id} message={result?.message}>
            <SkillCategoryFields values={result?.values ?? skillValues(category)} errors={result?.errors} />

            {#snippet actions()}
              <Button type="submit" variant="primary">Save</Button>
              <MoveButtons formaction="?/moveSkillCategory" first={index === 0} last={index === data.skillCategories.length - 1} />
              <ConfirmDelete name={category.category} formaction="?/deleteSkillCategory" />
            {/snippet}
          </ItemForm>
        </li>
      {/each}
    </ol>

    <ItemForm action="?/addSkillCategory" legend="Add a skill category" resetOnSuccess message={addSkillResult?.message}>
      <SkillCategoryFields values={addSkillResult?.values ?? {}} errors={addSkillResult?.errors} />

      {#snippet actions()}
        <Button type="submit" variant="primary">Add</Button>
      {/snippet}
    </ItemForm>
  </section>

  <section id="education">
    <h2>Education</h2>
    <p class="order">Newest first, by date.</p>

    <ol class="items">
      {#each data.qualifications as qualification (qualification.id)}
        {@const result = qualificationResult?.id === qualification.id ? qualificationResult : undefined}
        <li>
          <ItemForm action="?/updateQualification" legend={qualification.degree} id={qualification.id} message={result?.message}>
            <QualificationFields values={result?.values ?? qualificationValues(qualification)} errors={result?.errors} />

            {#snippet actions()}
              <Button type="submit" variant="primary">Save</Button>
              <ConfirmDelete name={qualification.degree} formaction="?/deleteQualification" />
            {/snippet}
          </ItemForm>
        </li>
      {/each}
    </ol>

    <ItemForm action="?/addQualification" legend="Add a qualification" resetOnSuccess message={addQualificationResult?.message}>
      <QualificationFields values={addQualificationResult?.values ?? {}} errors={addQualificationResult?.errors} />

      {#snippet actions()}
        <Button type="submit" variant="primary">Add</Button>
      {/snippet}
    </ItemForm>
  </section>

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
  .jump {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: calc(-1 * var(--space-3));
    font-size: var(--font-size-2);
    font-weight: 600;
  }

  section {
    display: grid;
    gap: var(--space-5);
    width: 100%;
    padding-top: var(--space-4);
    border-top: var(--border-thick) solid var(--colour-foreground);
  }

  .order {
    margin-top: calc(-1 * var(--space-4));
    color: var(--colour-text-muted);
    font-size: var(--font-size-2);
  }

  .items {
    display: grid;
    gap: var(--space-6);
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
