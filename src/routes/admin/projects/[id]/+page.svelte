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
  import ProjectDisplay, { type ProjectBand } from "$lib/components/projects/ProjectDisplay.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  // After a failed save, the form shows what was typed. Otherwise it shows what's saved
  const values: Record<string, string> = $derived(
    form?.values ?? {
      title: data.project.title,
      description: data.project.description,
      imageURL: data.project.imageURL,
      liveURL: data.project.liveURL ?? "",
      liveLabel: data.project.liveLabel ?? "",
      sourceURL: data.project.sourceURL ?? "",
      stack: data.project.stack.join("\n"),
      year: data.project.year === null ? "" : String(data.project.year),
      highlights: data.project.highlights.join("\n"),
      featured: data.project.featured ? "on" : "",
      showOnCV: data.project.showOnCV ? "on" : "",
      published: data.project.published ? "on" : "",
    }
  );

  // What's been typed since the page loaded. Until then, the preview shows the form's starting values
  let typedBand = $state<ProjectBand>();
  const band = $derived(typedBand ?? bandFrom(values));

  /** The band's fields from the form's text, trimmed, with empty optional fields as null like a save stores them */
  function bandFrom(fields: Record<string, string | undefined>): ProjectBand {
    const text = (name: string) => (fields[name] ?? "").trim();
    return {
      title: text("title"),
      description: text("description"),
      imageURL: text("imageURL"),
      liveURL: text("liveURL") || null,
      liveLabel: text("liveLabel") || null,
      sourceURL: text("sourceURL") || null,
    };
  }

  function updatePreview(event: Event & { currentTarget: HTMLFormElement }): void {
    const fields: Record<string, string> = {};
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string") fields[name] = value;
    }
    typedBand = bandFrom(fields);
  }
</script>

<AdminPage title={data.project.title} description="Edit a project.">
  <form method="POST" action="?/save" use:enhance={keepValues} oninput={updatePreview}>
    <fieldset>
      <legend>On the site</legend>
      <div class="fields">
        <Field label="Name" name="title" value={values.title} error={form?.errors?.title?.[0]} />
        <Field label="One-liner" name="description" value={values.description} error={form?.errors?.description?.[0]} />
        <div class="wide">
          <Field label="Screenshot URL" name="imageURL" value={values.imageURL} error={form?.errors?.imageURL?.[0]} />
        </div>
        <Field label="Live link" name="liveURL" hint="Optional" value={values.liveURL} error={form?.errors?.liveURL?.[0]} />
        <Field label="Live link text" name="liveLabel" hint="Needed when there's a live link" value={values.liveLabel} error={form?.errors?.liveLabel?.[0]} />
        <Field label="Source link" name="sourceURL" hint="Optional" value={values.sourceURL} error={form?.errors?.sourceURL?.[0]} />
      </div>
    </fieldset>

    <div class="preview">
      <h2>Preview</h2>
      <ProjectDisplay project={band} index={data.position} headingLevel="h3" />
    </div>

    <fieldset>
      <legend>On the CV</legend>
      <div class="fields">
        <Field label="Year" name="year" hint="Optional" inputmode="numeric" value={values.year} error={form?.errors?.year?.[0]} />
        <Field label="Stack" name="stack" multiline hint="One per line" value={values.stack} error={form?.errors?.stack?.[0]} />
        <div class="wide">
          <Field label="Highlights" name="highlights" multiline hint="One per line" value={values.highlights} error={form?.errors?.highlights?.[0]} />
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Where it shows</legend>
      <div class="checks">
        <Checkbox label="Published" name="published" checked={values.published === "on"} />
        <Checkbox label="Featured on the home page" name="featured" checked={values.featured === "on"} />
        <Checkbox label="Shown on the CV" name="showOnCV" checked={values.showOnCV === "on"} />
      </div>
    </fieldset>

    <div class="actions">
      <Button type="submit" variant="primary">Save</Button>
      <ConfirmDelete name={data.project.title} formaction="?/delete" />
      {#if form?.message}
        <FormMessage status="success">{form.message}</FormMessage>
      {/if}
    </div>
  </form>

  <a href={resolve("/admin/projects")}>Back to the projects</a>
</AdminPage>

<style>
  form {
    display: grid;
    gap: var(--space-5);
    width: 100%;
  }

  fieldset,
  .actions {
    max-width: 48rem;
  }

  fieldset {
    display: grid;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    border: none;
  }

  legend {
    margin-bottom: var(--space-3);
    color: var(--colour-foreground);
    font-family: var(--font-display);
    font-size: var(--font-size-5);
    font-weight: 700;
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

  .checks {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
  }

  .preview {
    display: grid;
    gap: var(--space-2);

    h2 {
      color: var(--colour-text-muted);
      font-family: var(--font-body);
      font-size: var(--font-size-2);
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }
</style>
