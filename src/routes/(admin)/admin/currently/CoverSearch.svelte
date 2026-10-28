<!--
  @component
  A Find cover button that opens a search of Spotify, Steam, TVmaze or Open Library. It starts with the row's title
  and guesses the source from its label. Picking a result copies its cover into the image library, then calls
  `onpick` with the copy's address.
-->
<script lang="ts">
  import X from "@lucide/svelte/icons/x";
  import { z } from "zod";
  import Button from "$lib/components/form/Button.svelte";
  import { coverResultsSchema, type CoverResults, type CoverSource } from "$lib/schemas/coverSearch";

  interface Props {
    /** Called with the copied cover's address, after the dialog closes */
    onpick: (url: string) => void;
  }

  let { onpick }: Props = $props();

  const sources: { value: CoverSource; label: string; plural: string; from: string }[] = [
    { value: "album", label: "Album", plural: "albums", from: "Spotify" },
    { value: "game", label: "Game", plural: "games", from: "Steam" },
    { value: "show", label: "Show", plural: "shows", from: "TVmaze" },
    { value: "book", label: "Book", plural: "books", from: "Open Library" },
  ];

  const sourcesByLabel: Record<string, CoverSource> = { listening: "album", playing: "game", watching: "show", reading: "book" };

  const copiedCoverSchema = z.object({ url: z.url() });

  const headingID = $props.id();

  let opener = $state<HTMLElement>();
  let dialog = $state<HTMLDialogElement>();
  let source = $state<CoverSource>("album");
  let query = $state("");
  let results = $state<CoverResults>([]);
  let status = $state<"idle" | "searching" | "found" | "failed">("idle");
  /** What was searched for, so the messages name it even after the box changes */
  let searched = $state({ source: "album" as CoverSource, query: "" });
  let copying = $state<number | null>(null);
  let copyFailed = $state(false);
  // Each search counts up, so an answer to an older search is ignored
  let searchNumber = 0;

  const searchedSource = $derived(sources.find(item => item.value === searched.source) ?? sources[0]);

  /** The value of a field in the form this button sits in */
  function formValue(name: string): string {
    const field = opener?.closest("form")?.elements.namedItem(name);
    return field instanceof HTMLInputElement ? field.value.trim() : "";
  }

  function open(): void {
    query = formValue("title");
    source = sourcesByLabel[formValue("label").toLowerCase()] ?? "album";
    results = [];
    status = "idle";
    copyFailed = false;
    dialog?.showModal();
    if (query !== "") void search();
  }

  async function search(): Promise<void> {
    const words = query.trim();
    if (words === "") return;

    const thisSearch = ++searchNumber;
    searched = { source, query: words };
    status = "searching";
    copyFailed = false;

    const response = await fetch(`/api/admin/covers?${new URLSearchParams({ source, query: words })}`).catch(() => null);
    const body: unknown = response?.ok ? await response.json().catch(() => null) : null;
    if (thisSearch !== searchNumber) return;

    const parsed = coverResultsSchema.safeParse(body);
    if (!parsed.success) {
      status = "failed";
      return;
    }
    results = parsed.data;
    status = "found";
  }

  async function pick(index: number): Promise<void> {
    const result = results[index];
    if (!result || copying !== null) return;

    copying = index;
    copyFailed = false;
    const response = await fetch("/api/admin/covers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ coverURL: result.coverURL, title: result.title }),
    }).catch(() => null);
    const copied = copiedCoverSchema.safeParse(response?.ok ? await response.json().catch(() => null) : null);
    copying = null;

    if (!copied.success) {
      copyFailed = true;
      return;
    }
    // Closes first, so the dialog gives focus back to its button before the form moves it somewhere else
    dialog?.close();
    onpick(copied.data.url);
  }

  function chooseSource(value: CoverSource): void {
    source = value;
    void search();
  }

  // Keeps Enter from saving the form the dialog sits in, and searches instead
  function searchOnEnter(event: KeyboardEvent): void {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void search();
  }

  // Keeps Escape, typing and changes inside the dialog away from the form around it and the page's own Escape handlers
  function keepInside(event: Event): void {
    event.stopPropagation();
  }
</script>

<span bind:this={opener}><Button small onclick={open}>Find cover</Button></span>

<dialog class="cover-search" aria-labelledby={headingID} bind:this={dialog} onkeydown={keepInside} oninput={keepInside} onchange={keepInside}>
  <div class="head">
    <h2 id={headingID}>Find a cover</h2>
    <button class="close" type="button" aria-label="Close" onclick={() => dialog?.close()}><X size="1.5rem" aria-hidden="true" /></button>
  </div>

  <div class="controls">
    <div class="sources" role="group" aria-label="Search for">
      {#each sources as item (item.value)}
        <button type="button" aria-pressed={source === item.value} onclick={() => chooseSource(item.value)}>{item.label}</button>
      {/each}
    </div>
    <div class="query">
      <!-- No name, so the search is never sent with the row when it saves -->
      <input type="search" aria-label="Search words" bind:value={query} onkeydown={searchOnEnter} />
      <Button variant="primary" onclick={search}>Search</Button>
    </div>
  </div>

  <div class="results-area">
    {#if status === "searching"}
      <p class="message">Searching {searchedSource.from}…</p>
    {:else if status === "failed"}
      <p class="message failed" role="alert">{searchedSource.from} couldn't be reached. Try again in a minute.</p>
    {:else if status === "found" && results.length === 0}
      <p class="message">No {searchedSource.plural} found for “{searched.query}”.</p>
    {:else if status === "found"}
      <p class="note">Picking a cover copies it into your image library.</p>
      {#if copyFailed}
        <p class="message failed" role="alert">That cover couldn't be copied. Try another one.</p>
      {/if}
      <ul class="results">
        {#each results as result, index (result.coverURL)}
          <li>
            <button class="result" class:faded={copying !== null && copying !== index} type="button" disabled={copying !== null} onclick={() => pick(index)}>
              <span class="thumbnail">
                <img src={result.thumbnailURL} alt="" loading="lazy" referrerpolicy="no-referrer" />
                {#if copying === index}<span class="copying">Copying…</span>{/if}
              </span>
              <span class="title">{result.title}</span>
              {#if result.subtitle}<span class="subtitle">{result.subtitle}</span>{/if}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</dialog>

<style>
  .cover-search {
    width: min(60rem, 100vw - 2rem);
    max-width: none;
    height: min(48rem, 100dvh - 2rem);
    max-height: none;
    padding: var(--space-2) var(--space-3);
    border: var(--rule-section);
    background: var(--paper);
    color: var(--ink);

    &[open] {
      display: grid;
      grid-template-rows: auto auto minmax(0, 1fr);
      gap: var(--space-2);
    }

    &::backdrop {
      background: color-mix(in oklch, var(--ink) 45%, transparent);
    }
  }

  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: var(--space-1);
    border-bottom: var(--rule-row);

    h2 {
      font-size: var(--type-medium);
      font-weight: 900;
    }
  }

  .close {
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ink);
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    align-items: center;
  }

  .sources {
    display: flex;

    button {
      min-height: 2.75rem;
      padding: 0.5rem 1rem;
      border: var(--rule-row);
      border-radius: 0;
      background: transparent;
      color: var(--ink);
      font: inherit;
      font-weight: 700;
      cursor: pointer;

      & + button {
        margin-left: -2px;
      }

      &[aria-pressed="true"] {
        background: var(--ink);
        color: var(--paper);
      }
    }
  }

  .query {
    display: flex;
    flex: 1 1 18rem;
    gap: var(--space-1);
    min-width: 0;

    input {
      flex: 1;
      min-width: 0;
      padding: 0.625rem 0.75rem;
      border: var(--rule-row);
      border-radius: 0;
      background: var(--paper);
      color: var(--ink);
      font: inherit;
      caret-color: var(--red);
    }
  }

  .results-area {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    min-height: 0;
    overflow-y: auto;
  }

  .note {
    color: var(--muted);
    font-size: var(--type-small);
  }

  .message {
    color: var(--muted);
    font-weight: 600;

    &.failed {
      color: var(--red-text);
    }
  }

  .results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(9rem, 100%), 1fr));
    align-items: start;
    gap: var(--space-2);
    margin: 0;
    padding: 0.25rem;
    list-style: none;
  }

  .result {
    display: grid;
    gap: 0.25rem;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-align: start;
    cursor: pointer;
    transition: opacity var(--duration-quick) var(--ease-out);

    &:disabled {
      cursor: default;
    }

    &.faded {
      opacity: 0.35;
    }
  }

  /* Each cover keeps its own shape, so none is cropped or shown with empty bands */
  .thumbnail {
    position: relative;
    display: block;
    outline: var(--rule-row);
    background: var(--sunken);
    transition:
      transform var(--duration-quick) var(--ease-out),
      box-shadow var(--duration-quick) var(--ease-out);

    img {
      display: block;
      width: 100%;
      height: auto;
      filter: var(--filter-picture);
    }
  }

  .copying {
    position: absolute;
    inset: auto 0 0;
    padding: 0.25rem 0.5rem;
    background: var(--ink);
    color: var(--paper);
    font-size: var(--type-small);
    font-weight: 700;
  }

  .title {
    font-size: var(--type-small);
    font-weight: 700;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .subtitle {
    color: var(--muted);
    font-size: 0.875rem;
    line-height: 1.3;
  }

  .result:focus-visible {
    outline: none;

    .thumbnail {
      outline: 3px solid var(--red);
      outline-offset: 3px;
    }
  }

  @media (hover: hover) {
    .result:hover:not(:disabled) .thumbnail {
      transform: translate(-4px, -4px);
      box-shadow: 4px 4px 0 var(--red);
    }

    .close:hover {
      color: var(--red);
    }
  }
</style>
