<script lang="ts">
  import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

  // The same attributes go on the input or the textarea, so they have to suit both
  type Props = HTMLInputAttributes &
    HTMLTextareaAttributes & {
      label: string;
      error?: string;
      /** A short note under the field, like "Optional". An error replaces it */
      hint?: string;
      /** Several lines of text, for longer content */
      multiline?: boolean;
    };

  let { label, error, hint, multiline = false, value, ...inputAttributes }: Props = $props();

  const id = $props.id();
  const errorID = `${id}-error`;
  const hintID = `${id}-hint`;
  const describedBy = $derived(error ? errorID : hint ? hintID : undefined);

  let field = $state<HTMLDivElement>();
  let bounce: Animation | undefined;

  /** Bounces the field 1px as you type. Keystrokes during a bounce are skipped, so fast typing keeps a steady rhythm instead of vibrating */
  function handleInput(): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (bounce?.playState === "running") return;

    bounce = field?.animate([{ transform: "translateY(0)" }, { transform: "translateY(1px)" }, { transform: "translateY(0)" }], { duration: 200, easing: "ease-out" });
  }
</script>

<div class="field" class:invalid={error} bind:this={field}>
  <label for={id}>{label}</label>
  {#if multiline}
    <!-- Value set directly, not in the spread, so the server renders it as the textarea's text -->
    <textarea {id} rows="6" {value} aria-invalid={error ? true : undefined} aria-describedby={describedBy} oninput={handleInput} {...inputAttributes}></textarea>
  {:else}
    <input {id} {value} aria-invalid={error ? true : undefined} aria-describedby={describedBy} oninput={handleInput} {...inputAttributes} />
  {/if}
  {#if error}
    <p class="error" id={errorID}>{error}</p>
  {:else if hint}
    <p class="hint" id={hintID}>{hint}</p>
  {/if}
</div>

<style>
  .field {
    display: grid;
    gap: var(--space-1);
    transition: translate var(--duration-quick) var(--ease-out);

    &:focus-within {
      translate: 0 -2px;
    }
  }

  label {
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
    font-weight: 500;
  }

  input,
  textarea {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid color-mix(in oklch, var(--colour-text-muted) 55%, transparent);
    border-radius: var(--radius-medium);
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
    caret-color: var(--colour-accent);
    transition: border-color var(--duration-quick) var(--ease-out);

    &:hover {
      border-color: var(--colour-text-muted);
    }

    &:focus-visible {
      border-color: var(--colour-accent);
      outline: 2px solid color-mix(in oklch, var(--colour-accent) 35%, transparent);
      outline-offset: 0;
    }
  }

  textarea {
    resize: vertical;
  }

  .invalid :is(input, textarea) {
    border-color: var(--colour-red);
  }

  .hint {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
  }

  .error {
    color: var(--colour-red);
    font-size: var(--font-size-label);
    font-weight: 500;
  }
</style>
