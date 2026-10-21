<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
  import Plus from "@lucide/svelte/icons/plus";
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
  import { applyMarkup, shortcutMarkup, type Markup } from "$lib/components/editor/markdownInsert";
  import { savedTimeLabel } from "$lib/components/editor/savedTime";
  import Button from "$lib/components/form/Button.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  type ArticleValues = Record<"title" | "slug" | "summary" | "body" | "published", string>;
  type DetailValues = Pick<ArticleValues, "slug" | "published">;

  const savedValues: ArticleValues = $derived({
    title: data.article.title,
    slug: data.article.slug,
    summary: data.article.summary,
    body: data.article.body,
    published: data.article.published ? "on" : "",
  });

  // After a failed save, the form shows what was typed. Otherwise it shows what's saved
  const values: ArticleValues = $derived(form?.values ? { ...savedValues, ...form.values } : savedValues);

  // The writing fields and the details. Each resets to the values above when the page loads again, such as after a save
  let title = $derived(values.title);
  let summary = $derived(values.summary);
  let body = $derived(values.body);
  let details: DetailValues = $derived({ slug: values.slug, published: values.published });

  const currentValues: ArticleValues = $derived({ ...details, title, summary, body });

  const changedFields = $derived(Object.keys(savedValues).filter(field => currentValues[field as keyof ArticleValues] !== savedValues[field as keyof ArticleValues]));

  // Set by a save: whether it turned a draft live, or found nothing to save. Typing clears both
  let justPublished = $state(false);
  let nothingToSave = $state(false);

  const status = $derived.by(() => {
    if (form?.errors) return "Not saved. Fix the fields marked in red.";
    if (changedFields.length > 0) return "Unsaved changes";
    if (nothingToSave) return "Nothing to save.";
    if (justPublished) return "Published.";
    return form?.message ?? savedTimeLabel(data.article.updatedAt, new Date());
  });

  const wordCount = $derived(body.split(/\s+/).filter(word => word !== "").length);

  const preview = new LivePreview(
    untrack(() => data.preview.html),
    untrack(() => data.preview.readingMinutes)
  );

  const draftDelay = 1000;

  let formElement = $state<HTMLFormElement>();
  let bodyField = $state<HTMLTextAreaElement>();
  let previewPane = $state<HTMLDivElement>();
  let shownPane = $state<"write" | "preview">("write");
  let offeredDraft = $state<ArticleDraft | null>(null);
  let draftTimer: ReturnType<typeof setTimeout> | undefined;

  /** Reads the details from the form. The slug field and the switch can't bind to state, so the form holds their values */
  function readDetails(): void {
    if (!formElement) return;

    const formData = new FormData(formElement);
    const text = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value : "";
    };
    details = { slug: text("slug"), published: text("published") };
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

  function handleSummaryInput(event: Event & { currentTarget: HTMLInputElement | HTMLTextAreaElement }): void {
    summary = event.currentTarget.value;
  }

  function handleFormInput(): void {
    nothingToSave = false;
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

  function handleBodyKeydown(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;

    const markup = shortcutMarkup(event.key);
    if (!markup) return;
    event.preventDefault();
    void insertMarkup(markup);
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
  const saveArticle: SubmitFunction = ({ action, cancel }) => {
    if (action.search === "?/delete") {
      clearTimeout(draftTimer);
      clearDraft(data.article.id);
    } else if (changedFields.length === 0 && !form?.errors) {
      nothingToSave = true;
      cancel();
      return;
    }

    const wasPublished = data.article.published;
    return async ({ update }) => {
      await update({ reset: false });
      justPublished = !wasPublished && data.article.published;
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
    <a class="back label" href={resolve("/admin/articles")}><ArrowLeft size="1.125em" aria-hidden="true" /> <span class="back-label">Articles</span></a>

    <div class="title-field">
      <input class="title" name="title" aria-label="Title" placeholder="Title" bind:value={title} aria-invalid={form?.errors?.title ? true : undefined} />
      {#if form?.errors?.title}
        <p class="field-error">{form.errors.title[0]}</p>
      {/if}
    </div>

    <div class="tools">
      <p class="status" class:error={form?.errors} role="status">{status}</p>
      <!-- A checkbox underneath, so it works without JavaScript. Either word toggles it -->
      <label class="switch">
        <span class="side" aria-hidden="true">Draft</span>
        <input type="checkbox" role="switch" name="published" aria-label="Published" checked={values.published === "on"} />
        <span class="track" aria-hidden="true"></span>
        <span class="side" aria-hidden="true">Published</span>
      </label>
      <span class="theme"><ThemeToggle /></span>
      <span class="save"><Button type="submit" variant="primary">Save</Button></span>
    </div>
  </header>

  <div class="details">
    <Field label="Slug" name="slug" value={values.slug} error={form?.errors?.slug?.[0]} />
    <Field label="Summary" name="summary" value={summary} oninput={handleSummaryInput} error={form?.errors?.summary?.[0]} />
    <div class="details-actions">
      <!-- The saved slug, since the address only changes once a new slug is saved -->
      <a class="view" href={resolve("/(site)/articles/[slug]", { slug: data.article.slug })} target="_blank" rel="noopener">
        View<span class="visually-hidden"> (opens in a new tab)</span>
        <ArrowUpRight size="1.125em" aria-hidden="true" />
      </a>
      <ConfirmDelete name={data.article.title} formaction="?/delete" large />
    </div>
  </div>

  <div class="tabs">
    <button type="button" aria-pressed={shownPane === "write"} onclick={() => (shownPane = "write")}>Write</button>
    <button type="button" aria-pressed={shownPane === "preview"} onclick={() => (shownPane = "preview")}>Preview</button>
  </div>

  <div class="panes" data-shown={shownPane}>
    <div class="writing">
      {#if offeredDraft}
        <div class="restore">
          <p>Unsaved text from {formatDraftTime(offeredDraft.savedAt)}.</p>
          <div class="restore-actions">
            <Button small onclick={restoreDraft}>Restore</Button>
            <Button small onclick={discardDraft}>Discard</Button>
          </div>
        </div>
      {/if}
      <div class="toolbar">
        <EditorPanel label="Insert">
          {#snippet icon()}<Plus size="1.125em" aria-hidden="true" />{/snippet}
          <MarkdownReference oninsert={insertMarkup} />
        </EditorPanel>
      </div>
      <textarea
        class="body"
        name="body"
        aria-label="Body"
        placeholder="Write in markdown"
        bind:value={body}
        aria-invalid={form?.errors?.body ? true : undefined}
        bind:this={bodyField}
        oninput={handleBodyInput}
        onkeydown={handleBodyKeydown}
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
        {#if body.trim() === ""}
          <p class="empty">The body shows here as you write.</p>
        {/if}
      </div>
    </div>
  </div>

  <footer class="footer">
    <p>
      {wordCount}
      {wordCount === 1 ? "word" : "words"}
      {#if wordCount > 0}· {preview.readingMinutes} minute read{/if}
    </p>
  </footer>
</form>

<style>
  .editor {
    display: grid;
    grid-template-areas: "bar" "details" "tabs" "panes" "footer";
    grid-template-rows: auto auto auto minmax(0, 1fr) auto;
    height: 100dvh;
  }

  .bar {
    display: grid;
    grid-area: bar;
    grid-template-areas: "back title tools";
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--space-1) var(--space-3);
    padding: var(--space-1) var(--page-gutter);
    border-bottom: var(--rule-section);
  }

  .back {
    display: inline-flex;
    grid-area: back;
    align-items: center;
    gap: 0.4rem;
    text-decoration-color: transparent;
    transition: text-decoration-color var(--duration-quick) var(--ease-out);
  }

  .title-field {
    grid-area: title;
    min-width: 0;
  }

  .title {
    width: 100%;
    padding: 0.25rem 0;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: var(--type-medium);
    font-weight: 900;
    line-height: 1.1;
    text-transform: uppercase;
    caret-color: var(--red);

    &::placeholder {
      color: var(--muted);
    }

    &[aria-invalid="true"] {
      border-bottom-color: var(--red);
    }
  }

  .tools {
    display: flex;
    flex-wrap: wrap;
    grid-area: tools;
    justify-content: end;
    align-items: center;
    gap: var(--space-1) var(--space-2);
  }

  .status {
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;

    &.error {
      color: var(--red-text);
      font-weight: 700;
    }
  }

  .tabs {
    button {
      min-height: 2.25rem;
      padding: 0.25rem 0.75rem;
      border: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-size: 0.9375rem;
      font-weight: 700;
      cursor: pointer;

      &[aria-pressed="true"] {
        background: var(--ink);
        color: var(--paper);
      }
    }
  }

  .switch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.25rem;
    font-size: 0.9375rem;
    font-weight: 700;
    cursor: pointer;

    /* Hidden but still focusable, so the keyboard reaches it */
    input {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
  }

  .side {
    color: var(--muted);
    transition: color var(--duration-quick) var(--ease-out);
  }

  .switch:not(:has(:checked)) .side:first-child,
  .switch:has(:checked) .side:last-child {
    color: var(--ink);
  }

  .track {
    position: relative;
    width: 2.75rem;
    height: 1.5rem;
    border: var(--rule-row);
    transition: background-color var(--duration-quick) var(--ease-out);

    &::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 1rem;
      height: 1rem;
      background: var(--ink);
      transition: transform var(--duration-quick) var(--ease-out);
    }
  }

  .switch:has(:checked) .track {
    background: var(--red);

    &::after {
      transform: translateX(1.25rem);
    }
  }

  .switch:has(:focus-visible) .track {
    outline: 3px solid var(--red);
    outline-offset: 3px;
  }

  .details {
    display: grid;
    grid-area: details;
    grid-template-columns: minmax(0, 16rem) minmax(0, 1fr) auto;
    align-items: start;
    gap: var(--space-2) var(--space-3);
    padding: var(--space-2) var(--page-gutter);
    border-bottom: 1px solid var(--line);
  }

  .details-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    /* The height of a field's label and the gap under it, so the actions line up with the inputs */
    padding-top: calc(var(--type-small) * 1.6 + 0.35rem);
  }

  .view {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 2.75rem;
    font-weight: 700;
  }

  .tabs {
    display: none;
    grid-area: tabs;
    padding: var(--space-1) var(--page-gutter);
    border-bottom: 1px solid var(--line);
  }

  .panes {
    display: grid;
    grid-area: panes;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    min-height: 0;
  }

  .writing {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: var(--space-2) var(--page-gutter) 0;
    border-right: var(--rule-row);
  }

  .restore {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    margin-bottom: var(--space-2);
    padding: var(--space-1) var(--space-1) var(--space-1) var(--space-2);
    background: var(--sunken);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .restore-actions {
    display: flex;
    gap: var(--space-1);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--line);
  }

  .body {
    flex: 1;
    padding: var(--space-2) 0 var(--space-4);
    border: 0;
    background: transparent;
    color: var(--ink);
    font-family: var(--font-code);
    font-size: 0.875rem;
    line-height: 1.75;
    caret-color: var(--red);
    resize: none;
    tab-size: 2;

    &::placeholder {
      color: var(--muted);
    }
  }

  .field-error {
    margin-top: 0.25rem;
    color: var(--red-text);
    font-size: 0.875rem;
    font-weight: 700;
  }

  .preview {
    overflow-y: auto;
    padding-inline: var(--page-gutter);
  }

  .preview-failed {
    position: sticky;
    top: 0;
    max-width: var(--reading-width);
    margin: var(--space-2) auto 0;
    padding: var(--space-1) var(--space-2);
    background: var(--sunken);
    font-size: var(--type-small);
    font-weight: 600;
  }

  .page {
    max-width: var(--reading-width);
    margin-inline: auto;
    padding-bottom: var(--space-5);
  }

  .empty {
    color: var(--muted);
  }

  .footer {
    grid-area: footer;
    padding: var(--space-1) var(--page-gutter);
    border-top: 1px solid var(--line);
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  kbd {
    padding: 0 0.3em;
    border: 1px solid var(--line);
    font: inherit;
  }

  @media (hover: hover) {
    .back:hover {
      text-decoration-color: var(--red);
    }
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

  @media (max-width: 54rem) {
    .bar {
      grid-template-areas: "back tools" "title title";
      grid-template-columns: auto minmax(0, 1fr);
    }

    .details {
      grid-template-columns: minmax(0, 1fr);
    }

    .details-actions {
      padding-top: 0;
    }
  }

  @media (max-width: 40rem) {
    /* The tools join the bar's grid, so Save stays beside the back link and the status gets a row of its own */
    .bar {
      grid-template-areas: "back theme save" "title title title" "switch status status";
      grid-template-columns: minmax(0, 1fr) auto auto;
    }

    .tools {
      display: contents;
    }

    .theme {
      grid-area: theme;
    }

    .save {
      grid-area: save;
    }

    .switch {
      grid-area: switch;
      justify-self: start;
    }

    .status {
      grid-area: status;
      justify-self: end;
      text-align: end;
    }

    .back-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .tabs button {
      flex: 1;
    }
  }
</style>
