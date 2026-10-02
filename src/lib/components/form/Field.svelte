<script lang="ts">
  import type { FormEventHandler, HTMLInputAttributes } from "svelte/elements";

  interface Props extends HTMLInputAttributes {
    label: string;
    error?: string;
    compact?: boolean;
  }

  let { label, error, compact = false, oninput, ...inputAttributes }: Props = $props();

  const id = $props.id();
  const errorID = `${id}-error`;

  let field = $state<HTMLDivElement>();
  let bounce: Animation | undefined;

  /** Passes the event on to the parent's own handler, then bounces the field 1px. Keystrokes during a bounce are skipped, so fast typing keeps a steady rhythm instead of vibrating */
  const handleInput: FormEventHandler<HTMLInputElement> = event => {
    oninput?.(event);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (bounce?.playState === "running") return;

    bounce = field?.animate([{ transform: "translateY(0)" }, { transform: "translateY(1px)" }, { transform: "translateY(0)" }], { duration: 200, easing: "ease-out" });
  };
</script>

<div class="field" class:invalid={error} class:compact bind:this={field}>
  <label for={id}>{label}</label>
  <input {id} aria-invalid={error ? true : undefined} aria-describedby={error ? errorID : undefined} oninput={handleInput} {...inputAttributes} />
  {#if error}
    <p class="error" id={errorID}>{error}</p>
  {/if}
</div>

<style>
  .field {
    display: grid;
    justify-items: start;
    transition: translate var(--duration-quick) var(--ease-out);

    &:focus-within {
      translate: 0 -2px;
    }
  }

  label {
    padding: 0.3rem var(--space-2) 0.2rem;
    background: var(--colour-foreground);
    color: var(--colour-text-on-foreground);
    font-size: var(--font-size-2);
    font-weight: 700;
    transition:
      background var(--duration-quick) var(--ease-out),
      color var(--duration-quick) var(--ease-out);
  }

  input {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
    font-size: var(--font-size-4);
    caret-color: var(--colour-orange);

    &:focus-visible {
      outline: none;
      background: var(--colour-panel);
    }
  }

  .field:focus-within label {
    background: var(--colour-orange);
    color: var(--colour-text-on-orange);
  }

  .invalid input {
    border-style: dashed;
  }

  .compact {
    label {
      padding: 0.2rem var(--space-1) 0.1rem;
      font-size: var(--font-size-1);
    }

    input {
      padding: 0.25rem var(--space-1);
      font-size: var(--font-size-2);
    }
  }
  .error {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-top: var(--space-1);
    color: var(--colour-foreground);
    font-size: var(--font-size-2);
    font-weight: 600;

    &::before {
      content: "";
      flex: none;
      width: 0.5rem;
      height: 0.5rem;
      background: var(--colour-orange);
    }
  }
</style>
