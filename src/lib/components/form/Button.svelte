<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "primary" | "secondary" | "destructive";
    icon?: boolean;
    children: Snippet;
  }

  let { variant = "secondary", icon = false, type = "button", children, ...buttonAttributes }: Props = $props();
</script>

<button class={variant} class:icon {type} {...buttonAttributes}>
  {@render children()}
</button>

<style>
  button {
    padding: var(--space-2) var(--space-4);
    border: 1px solid transparent;
    border-radius: var(--radius-medium);
    font: inherit;
    font-size: var(--font-size-label);
    font-weight: 500;
    line-height: 1.4;
    cursor: pointer;
    transition:
      translate var(--duration-quick) var(--ease-out),
      background var(--duration-quick) var(--ease-out),
      border-color var(--duration-quick) var(--ease-out);

    &:active:not(:disabled) {
      translate: 0 1px;
    }

    &:disabled {
      color: var(--colour-text-muted);
      cursor: not-allowed;
    }
  }

  .icon {
    display: inline-grid;
    place-items: center;
    padding: var(--space-2);

    :global(svg) {
      width: 1lh;
      height: 1lh;
    }
  }

  .primary {
    background: var(--colour-accent);
    color: var(--colour-background);
  }

  .secondary {
    border-color: var(--colour-divider);
    background: transparent;
    color: var(--colour-foreground);
  }

  .destructive {
    background: var(--colour-red);
    color: var(--colour-text-on-red);
  }

  .secondary:disabled {
    border-style: dashed;
  }

  @media (hover: hover) {
    .primary:hover:not(:disabled) {
      background: color-mix(in oklch, var(--colour-accent) 85%, var(--colour-foreground));
    }

    .secondary:hover:not(:disabled) {
      border-color: var(--colour-text-muted);
      background: var(--colour-surface);
    }

    .destructive:hover:not(:disabled) {
      background: color-mix(in oklch, var(--colour-red) 85%, var(--colour-foreground));
    }
  }
</style>
