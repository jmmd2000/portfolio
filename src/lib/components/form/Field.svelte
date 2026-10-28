<script lang="ts">
  import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

  // The same attributes go on the input or the textarea, so they have to suit both
  type Props = HTMLInputAttributes &
    HTMLTextareaAttributes & {
      label: string;
      error?: string;
      /** A short note under the field, like "Optional". An error replaces it */
      hint?: string;
      multiline?: boolean;
    };

  let { label, error, hint, multiline = false, value, oninput, ...inputAttributes }: Props = $props();

  const id = $props.id();
  const errorID = `${id}-error`;
  const hintID = `${id}-hint`;
  const describedBy = $derived(error ? errorID : hint ? hintID : undefined);

  let field = $state<HTMLDivElement>();
  let bounce: Animation | undefined;

  /** Bounces the field 1px as you type. Keystrokes during a bounce are skipped, so fast typing keeps a steady rhythm instead of vibrating */
  function bounceField(): void {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (bounce?.playState === "running") return;

    bounce = field?.animate([{ transform: "translateY(0)" }, { transform: "translateY(1px)" }, { transform: "translateY(0)" }], { duration: 200, easing: "ease-out" });
  }
</script>

<div class="field" class:invalid={error} bind:this={field}>
  <label for={id}>{label}</label>
  {#if multiline}
    <!-- Value set directly, not in the spread, so the server renders it as the textarea's text -->
    <textarea
      {id}
      rows="6"
      {value}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...inputAttributes}
      oninput={event => {
        bounceField();
        oninput?.(event);
      }}></textarea>
  {:else}
    <input
      {id}
      {value}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...inputAttributes}
      oninput={event => {
        bounceField();
        oninput?.(event);
      }}
    />
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
    align-content: start;
    gap: 0.35rem;
  }

  label {
    font-size: var(--type-small);
    font-weight: 700;
  }

  input,
  textarea {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.625rem 0.75rem;
    border: var(--rule-row);
    border-radius: 0;
    background: var(--paper);
    color: var(--ink);
    font: inherit;
    font-size: 1rem;
    caret-color: var(--red);

    &:focus-visible {
      outline-offset: 0;
    }
  }

  textarea {
    min-height: 7rem;
    line-height: 1.5;
    resize: vertical;
  }

  .invalid :is(input, textarea) {
    border-color: var(--red);
  }

  .hint {
    color: var(--muted);
    font-size: 0.875rem;
  }

  .error {
    color: var(--red-text);
    font-size: 0.875rem;
    font-weight: 700;
  }
</style>
