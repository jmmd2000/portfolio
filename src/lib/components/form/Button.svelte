<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "primary" | "secondary" | "destructive";
    children: Snippet;
  }

  let { variant = "secondary", type = "button", children, ...buttonAttributes }: Props = $props();
</script>

<button class={variant} {type} {...buttonAttributes}>
  {@render children()}
</button>

<style>
  button {
    padding: var(--space-2) var(--space-4);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition:
      translate var(--duration-quick) var(--ease-out),
      background var(--duration-quick) var(--ease-out),
      color var(--duration-quick) var(--ease-out);

    @media (hover: hover) {
      &:hover:not(:disabled) {
        background: var(--colour-foreground);
        color: var(--colour-background);
        translate: 0 -2px;
      }
    }

    &:active:not(:disabled) {
      translate: 0 4px;
    }

    &:disabled {
      border-style: dashed;
      color: var(--colour-text-muted);
      cursor: not-allowed;
    }
  }

  .primary {
    background: var(--colour-orange);
    color: var(--colour-text-on-orange);
  }

  .secondary {
    background: var(--colour-background);
    color: var(--colour-foreground);
  }

  .destructive {
    background: var(--colour-red);
    color: var(--colour-text-on-red);
  }
</style>
