<script lang="ts">
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import ItemForm from "$lib/components/admin/ItemForm.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import type { Job } from "$lib/server/content/cv";
  import type { PageProps } from "./$types";
  import JobFields from "./JobFields.svelte";

  let { data, form }: PageProps = $props();

  const jobResult = $derived(form?.list === "jobs" ? form : undefined);
  const addJobResult = $derived(jobResult?.id === "new" ? jobResult : undefined);

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
</script>

<AdminPage title="CV" description="Edit the CV.">
  <section id="jobs">
    <h2>Jobs</h2>
    <p class="order">Newest first, by date.</p>

    <ol class="items">
      {#each data.jobs as job (job.id)}
        <!-- Only the form that was submitted shows its result: the saved message, or what was typed and what's wrong -->
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

  <a href={resolve("/admin")}>Back to the admin</a>
</AdminPage>

<style>
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
