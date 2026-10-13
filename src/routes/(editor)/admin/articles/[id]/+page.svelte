<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import BookOpenText from "@lucide/svelte/icons/book-open-text";
  import SlidersHorizontal from "@lucide/svelte/icons/sliders-horizontal";
  import type { SubmitFunction } from "@sveltejs/kit";
  import { tick, untrack } from "svelte";
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import ConfirmDelete from "$lib/components/admin/ConfirmDelete.svelte";
  import ArticleView from "$lib/components/articles/ArticleView.svelte";
  import { clearDraft, formatDraftTime, isWorthRestoring, readDraft, writeDraft, type ArticleDraft } from "$lib/components/editor/articleDraft";
  import EditorPanel from "$lib/components/editor/EditorPanel.svelte";
  import { LivePreview } from "$lib/components/editor/livePreview.svelte";
  import MarkdownReference from "$lib/components/editor/MarkdownReference.svelte";
  import { applyMarkup, type Markup } from "$lib/components/editor/markdownInsert";
  import Button from "$lib/components/form/Button.svelte";
  import Checkbox from "$lib/components/form/Checkbox.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import SelectField from "$lib/components/form/SelectField.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  type ArticleValues = Record<"title" | "slug" | "summary" | "body" | "projectID" | "published", string>;
  type DetailValues = Pick<ArticleValues, "slug" | "projectID" | "published">;

  const savedValues: ArticleValues = $derived({
    title: data.article.title,
    slug: data.article.slug,
    summary: data.article.summary,
    body: data.article.body,
    projectID: data.article.projectID === null ? "" : String(data.article.projectID),
    published: data.article.published ? "on" : "",
  });

  // After a failed save, the form shows what was typed. Otherwise it shows what's saved
  const values: ArticleValues = $derived(form?.values ? { ...savedValues, ...form.values } : savedValues);

  // The writing fields and the details. Each resets to the values above when the page loads again, such as after a save
  let title = $derived(values.title);
  let summary = $derived(values.summary);
  let body = $derived(values.body);
  let details: DetailValues = $derived({ slug: values.slug, projectID: values.projectID, published: values.published });

  const currentValues: ArticleValues = $derived({ ...details, title, summary, body });

  const changedFields = $derived(Object.keys(savedValues).filter(field => currentValues[field as keyof ArticleValues] !== savedValues[field as keyof ArticleValues]));
  const hasDetailsError = $derived(Boolean(form?.errors?.slug ?? form?.errors?.projectID));

  const status = $derived.by(() => {
    if (form?.errors) return "Not saved. Fix the fields marked in red.";
    if (changedFields.length > 0) return "Unsaved changes";
    return form?.message ?? "";
  });

  const projectOptions = $derived([{ value: "", label: "None" }, ...data.projectChoices.map(project => ({ value: String(project.id), label: project.title }))]);

  const preview = new LivePreview(
    untrack(() => data.preview.html),
    untrack(() => data.preview.readingMinutes)
  );

  const draftDelay = 1000;

  let formElement = $state<HTMLFormElement>();
  let bodyField = $state<HTMLTextAreaElement>();
  let previewPane = $state<HTMLDivElement>();
  let detailsOpen = $derived(hasDetailsError);
  let shownPane = $state<"write" | "preview">("write");
  let offeredDraft = $state<ArticleDraft | null>(null);
  let draftTimer: ReturnType<typeof setTimeout> | undefined;

  /** Reads the details from the form. The select and the checkbox can't bind to state, so the form holds their values */
  function readDetails(): void {
    if (!formElement) return;

    const formData = new FormData(formElement);
    const text = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };
    details = { slug: text("slug"), projectID: text("projectID"), published: text("published") };
  }

  /** Keeps the writing in the browser, or clears it once it matches what's saved */
  function keepDraft(): void {
    clearTimeout(draftTimer);
    draftTimer = undefined;

    if (title === savedValues.title && summary === savedValues.summary && body === savedValues.body) {
      clearDraft(data.article.id);
      return;
    }
    writeDraft(data.article.id, { title, summary, body, savedAt: new Date() });
  }

  function keepPendingDraft(): void {
    if (draftTimer !== undefined) keepDraft();
  }

  function scheduleDraft(): void {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(keepDraft, draftDelay);
  }

  function handleFormInput(): void {
    readDetails();
    scheduleDraft();
  }

  /** Applies markup to the body at its selection, then puts the cursor back in the body with the new selection */
  async function insertMarkup(markup: Markup): Promise<void> {
    if (!bodyField) return;

    const result = applyMarkup({ text: body, start: bodyField.selectionStart, end: bodyField.selectionEnd }, markup);
    body = result.text;
    preview.schedule(body);
    scheduleDraft();
    shownPane = "write";
    // The body shows the new text once Svelte updates it, and only then can its selection be set
    await tick();
    bodyField.focus();
    bodyField.setSelectionRange(result.start, result.end);
  }

  // The offered draft stays in memory, so new writing can replace the kept copy while the offer still shows
  function restoreDraft(): void {
    if (!offeredDraft) return;

    title = offeredDraft.title;
    summary = offeredDraft.summary;
    body = offeredDraft.body;
    offeredDraft = null;
    preview.schedule(body);
    keepDraft();
  }

  function discardDraft(): void {
    offeredDraft = null;
    keepDraft();
  }

  function handleBodyInput(event: Event & { currentTarget: HTMLTextAreaElement }): void {
    preview.schedule(event.currentTarget.value);
  }

  /** Scrolls the preview to the same share of the way down as the body */
  function followScroll(): void {
    if (!bodyField || !previewPane) return;

    const bodyRange = bodyField.scrollHeight - bodyField.clientHeight;
    const share = bodyRange > 0 ? bodyField.scrollTop / bodyRange : 0;
    previewPane.scrollTop = share * (previewPane.scrollHeight - previewPane.clientHeight);
  }

  function handleKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      formElement?.requestSubmit();
    }
  }

  // A new render can change the preview's height, so it scrolls to match the body again
  $effect(() => {
    void preview.html;
    followScroll();
  });

  /** Keeps every field after a save, the way `keepValues` does, then clears the kept draft once it matches what's saved */
  const saveArticle: SubmitFunction = ({ action }) => {
    if (action.search === "?/delete") {
      clearTimeout(draftTimer);
      clearDraft(data.article.id);
    }

    return async ({ update }) => {
      await update({ reset: false });
      keepDraft();
    };
  };

  $effect(() => {
    untrack(() => {
      const draft = readDraft(data.article.id);
      if (draft && isWorthRestoring(draft, savedValues, data.article.updatedAt)) offeredDraft = draft;
    });

    return () => {
      preview.stop();
      keepPendingDraft();
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} onpagehide={keepPendingDraft} />

<PageHead title="Editing {data.article.title}" description="Write an article." noindex />

<form class="editor" method="POST" action="?/save" bind:this={formElement} use:enhance={saveArticle} oninput={handleFormInput} onchange={readDetails}>
  <header class="bar">
    <a class="back" href={resolve("/admin/articles")}><ArrowLeft size="1.125em" aria-hidden="true" /> <span class="back-label">Articles</span></a>
    <p class="state">{data.article.published ? "Published" : "Draft"}</p>
    <p class="status" class:error={form?.errors} role="status">{status}</p>

    <div class="tabs">
      <button type="button" aria-pressed={shownPane === "write"} onclick={() => (shownPane = "write")}>Write</button>
      <button type="button" aria-pressed={shownPane === "preview"} onclick={() => (shownPane = "preview")}>Preview</button>
    </div>

    <!-- The saved slug, since the address only changes once a new slug is saved -->
    <a class="view" href={resolve("/(site)/articles/[slug]", { slug: data.article.slug })} target="_blank" rel="noopener">
      <span class="bar-label">View</span><span class="visually-hidden"> (opens in a new tab)</span>
      <ArrowUpRight size="1.125em" aria-hidden="true" />
    </a>

    <div class="save">
      <Button type="submit" variant="primary">Save</Button>
    </div>

    <EditorPanel label="Markdown">
      {#snippet icon()}<BookOpenText size="1.125em" aria-hidden="true" />{/snippet}
      <MarkdownReference oninsert={insertMarkup} />
    </EditorPanel>

    <EditorPanel label="Details" bind:open={detailsOpen}>
      {#snippet icon()}<SlidersHorizontal size="1.125em" aria-hidden="true" />{/snippet}
      <Field label="Slug" name="slug" hint="The end of its address, like my-first-article" value={values.slug} error={form?.errors?.slug?.[0]} />
      <SelectField label="Write-up for" name="projectID" options={projectOptions} value={values.projectID} hint="Optional" error={form?.errors?.projectID?.[0]} />
      <Checkbox label="Published" name="published" checked={values.published === "on"} />
      <div class="delete">
        <ConfirmDelete name={data.article.title} formaction="?/delete" />
      </div>
    </EditorPanel>
  </header>

  <div class="panes" data-shown={shownPane}>
    <div class="writing">
      {#if offeredDraft}
        <div class="restore">
          <p>Unsaved text from {formatDraftTime(offeredDraft.savedAt)}.</p>
          <div class="restore-actions">
            <Button onclick={restoreDraft}>Restore</Button>
            <Button onclick={discardDraft}>Discard</Button>
          </div>
        </div>
      {/if}
      <input class="title" name="title" aria-label="Title" placeholder="Title" bind:value={title} aria-invalid={form?.errors?.title ? true : undefined} />
      {#if form?.errors?.title}
        <p class="field-error">{form.errors.title[0]}</p>
      {/if}
      <input class="summary" name="summary" aria-label="Summary" placeholder="Summary" bind:value={summary} aria-invalid={form?.errors?.summary ? true : undefined} />
      {#if form?.errors?.summary}
        <p class="field-error">{form.errors.summary[0]}</p>
      {/if}
      <textarea
        class="body"
        name="body"
        aria-label="Body"
        placeholder="Write in markdown"
        bind:value={body}
        aria-invalid={form?.errors?.body ? true : undefined}
        bind:this={bodyField}
        oninput={handleBodyInput}
        onscroll={followScroll}></textarea>
      {#if form?.errors?.body}
        <p class="field-error">{form.errors.body[0]}</p>
      {/if}
    </div>

    <div class="preview" role="region" aria-label="Preview" bind:this={previewPane}>
      {#if preview.failed}
        <p class="preview-failed" role="status">Preview unavailable. It tries again when you next type.</p>
      {/if}
      <div class="page">
        <ArticleView title={title || "Untitled"} date={data.preview.date} dateTime={data.preview.dateTime} readingMinutes={preview.readingMinutes} html={preview.html} />
      </div>
    </div>
  </div>
</form>

<style>
  .editor {
    --bar-height: 3.75rem;

    display: grid;
    grid-template-rows: var(--bar-height) minmax(0, 1fr);
    height: 100dvh;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding-inline: var(--space-4);
    border-bottom: 1px solid var(--colour-divider);
  }

  .back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
    font-weight: 500;
    text-decoration: none;
  }

  .state {
    padding: 0.125rem var(--space-2);
    border-radius: var(--radius-small);
    background: var(--colour-surface);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  .status {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
    white-space: nowrap;
    text-overflow: ellipsis;

    &.error {
      color: var(--colour-red);
      font-weight: 500;
    }
  }

  .tabs {
    display: none;
    gap: var(--space-1);

    button {
      padding: var(--space-1) var(--space-3);
      border: 0;
      border-radius: var(--radius-medium);
      background: transparent;
      color: var(--colour-text-muted);
      font: inherit;
      font-size: var(--font-size-label);
      font-weight: 500;
      cursor: pointer;

      &[aria-pressed="true"] {
        background: var(--colour-surface);
        color: var(--colour-foreground);
      }
    }
  }

  .view {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2);
    border-radius: var(--radius-medium);
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
    font-weight: 500;
    text-decoration: none;

    &:hover {
      background: var(--colour-surface);
    }
  }

  /* Save comes first in the markup, so Enter in a field saves instead of opening the delete dialog */
  .save {
    order: 1;
  }

  .delete {
    padding-top: var(--space-4);
    border-top: 1px solid var(--colour-divider);
  }

  .panes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: 0;
  }

  .writing {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: var(--space-6) var(--page-gutter) 0;
    border-right: 1px solid var(--colour-divider);

    > * {
      width: 100%;
      max-width: var(--reading-width);
      margin-inline: auto;
    }
  }

  .restore {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2) var(--space-4);
    margin-bottom: var(--space-5);
    padding: var(--space-3) var(--space-3) var(--space-3) var(--space-4);
    border-radius: var(--radius-medium);
    background: var(--colour-surface);
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
  }

  .restore-actions {
    display: flex;
    gap: var(--space-2);
  }

  .title,
  .summary,
  .body {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--colour-foreground);
    caret-color: var(--colour-accent);

    &::placeholder {
      color: var(--colour-text-muted);
    }

    &:focus-visible {
      outline: none;
    }
  }

  .title {
    font: inherit;
    font-size: var(--font-size-heading);
    font-weight: 600;
    line-height: 1.3;
  }

  .summary {
    margin-top: var(--space-2);
    font: inherit;
    font-size: var(--font-size-summary);
    color: var(--colour-text);
  }

  .body {
    flex: 1;
    margin-top: var(--space-5);
    padding-block: var(--space-5) var(--space-7);
    border-top: 1px solid var(--colour-divider);
    font-family: var(--font-code);
    font-size: var(--font-size-code);
    line-height: 1.75;
    resize: none;
    tab-size: 2;
  }

  .field-error {
    margin-top: var(--space-1);
    color: var(--colour-red);
    font-size: var(--font-size-label);
    font-weight: 500;
  }

  .preview {
    overflow-y: auto;
    padding-inline: var(--page-gutter);
  }

  .preview-failed {
    position: sticky;
    top: 0;
    max-width: var(--reading-width);
    margin: var(--space-3) auto 0;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-medium);
    background: var(--colour-surface);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  .page {
    max-width: var(--reading-width);
    margin-inline: auto;
    padding-bottom: var(--space-8);
  }

  @media (max-width: 64rem) {
    .tabs {
      display: flex;
    }

    .panes {
      grid-template-columns: minmax(0, 1fr);
    }

    .writing {
      border-right: 0;
    }

    .panes[data-shown="write"] .preview,
    .panes[data-shown="preview"] .writing {
      display: none;
    }
  }

  @media (max-width: 40rem) {
    /* The bar wraps onto two rows, with the Write and Preview tabs on the second */
    .editor {
      --bar-height: 6.25rem;
    }

    .bar {
      flex-wrap: wrap;
      align-content: center;
      gap: var(--space-2);
      padding-inline: var(--space-3);
    }

    .tabs {
      order: 2;
      width: 100%;

      button {
        flex: 1;
      }
    }

    .state,
    .back-label {
      display: none;
    }

    /* Only the icon shows, and screen readers still hear the word */
    .bar-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
</style>
