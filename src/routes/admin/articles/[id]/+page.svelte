<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import AdminPage from "$lib/components/admin/AdminPage.svelte";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import Button from "$lib/components/form/Button.svelte";
  import Checkbox from "$lib/components/form/Checkbox.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import FormMessage from "$lib/components/form/FormMessage.svelte";
  import { keepValues } from "$lib/components/form/keepValues";
  import SelectField from "$lib/components/form/SelectField.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  // After a failed save, the form shows what was typed. Otherwise it shows what's saved
  const values: Record<string, string> = $derived(
    form?.values ?? {
      title: data.article.title,
      slug: data.article.slug,
      summary: data.article.summary,
      body: data.article.body,
      projectID: data.article.projectID === null ? "" : String(data.article.projectID),
      published: data.article.published ? "on" : "",
    }
  );

  const projectOptions = $derived([{ value: "", label: "None" }, ...data.projectChoices.map(project => ({ value: String(project.id), label: project.title }))]);
</script>

<AdminPage title={data.article.title} description="Edit an article.">
  <form method="POST" action="?/save" use:enhance={keepValues}>
    <div class="fields">
      <Field label="Title" name="title" value={values.title} error={form?.errors?.title?.[0]} />
      <Field label="Slug" name="slug" hint="The end of its address, like my-first-article" value={values.slug} error={form?.errors?.slug?.[0]} />
      <div class="wide">
        <Field label="Summary" name="summary" value={values.summary} error={form?.errors?.summary?.[0]} />
      </div>
      <div class="wide">
        <Field label="Body" name="body" multiline rows={24} hint="Markdown" value={values.body} error={form?.errors?.body?.[0]} />
      </div>
      <SelectField label="Write-up for" name="projectID" options={projectOptions} value={values.projectID} hint="Optional" error={form?.errors?.projectID?.[0]} />
    </div>

    <Checkbox label="Published" name="published" checked={values.published === "on"} />

    <div class="actions">
      <Button type="submit" variant="primary">Save</Button>
      <ConfirmDelete name={data.article.title} formaction="?/delete" />
      {#if form?.message}
        <FormMessage status="success">{form.message}</FormMessage>
      {/if}
    </div>
  </form>

  <a href={resolve("/admin/articles")}>Back to the articles</a>
</AdminPage>

<style>
  form {
    display: grid;
    gap: var(--space-5);
    width: 100%;
    max-width: 48rem;
  }

  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
    align-items: start;
    gap: var(--space-3);
  }

  .wide {
    grid-column: 1 / -1;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }
</style>
