<script lang="ts">
  interface SelectOption {
    value: string;
    label: string;
  }

  interface Props {
    label: string;
    name: string;
    options: SelectOption[];
    value: string;
    error?: string;
    /** A short note under the field. An error replaces it */
    hint?: string;
  }

  let { label, name, options, value, error, hint }: Props = $props();

  const id = $props.id();
  const errorID = `${id}-error`;
  const hintID = `${id}-hint`;
  const describedBy = $derived(error ? errorID : hint ? hintID : undefined);
</script>

<div class="field" class:invalid={error}>
  <label for={id}>{label}</label>
  <select {id} {name} aria-invalid={error ? true : undefined} aria-describedby={describedBy}>
    {#each options as option (option.value)}
      <option value={option.value} selected={option.value === value}>{option.label}</option>
    {/each}
  </select>
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
  }

  label {
    color: var(--colour-foreground);
    font-size: var(--font-size-label);
    font-weight: 500;
  }

  select {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid color-mix(in oklch, var(--colour-text-muted) 55%, transparent);
    border-radius: var(--radius-medium);
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
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

  .invalid select {
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
