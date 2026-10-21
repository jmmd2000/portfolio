<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";
  import { codeLanguageNames } from "$lib/markdown/codeLanguages";
  import { markdownGroups, type Markup } from "./markdownInsert";

  interface Props {
    /** Called with an entry's markup when its Insert button is pressed */
    oninsert: (markup: Markup) => void;
  }

  let { oninsert }: Props = $props();

  const languages = codeLanguageNames()
    .map(language => `${language.name} (${language.fenceWords.join(", ")})`)
    .join(", ");
</script>

<p class="note">Insert puts it at the cursor, or wraps the selected text. Ctrl or Cmd with the letter shown does the same.</p>

{#each markdownGroups as group (group.name)}
  <section aria-label={group.name}>
    <h3>{group.name}</h3>
    <ul>
      {#each group.entries as entry (entry.name)}
        <li>
          <span class="name">
            {entry.name}
            {#if entry.shortcut}
              <kbd>{entry.shortcut}</kbd>
            {/if}
          </span>
          <code>{entry.syntax}</code>
          <Button aria-label="Insert {entry.name.toLowerCase()}" onclick={() => oninsert(entry.markup)}>Insert</Button>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<p class="note">Code blocks are highlighted for {languages}.</p>

<style>
  .note {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  h3 {
    margin-bottom: var(--old-space-1);
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
    font-weight: 500;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--old-space-3);
    padding-block: var(--old-space-1);
  }

  .name {
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
    font-weight: 500;
  }

  kbd {
    margin-inline-start: var(--old-space-1);
    padding: 0 0.3em;
    border: 1px solid var(--colour-divider);
    border-radius: var(--radius-small);
    color: var(--colour-text-muted);
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  code {
    overflow: hidden;
    color: var(--colour-text);
    font-family: var(--font-code);
    font-size: var(--font-size-code);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
