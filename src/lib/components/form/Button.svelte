<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Props extends HTMLButtonAttributes {
    variant?: "primary" | "secondary" | "destructive";
    icon?: boolean;
    /** A shorter button, for buttons on a list row */
    small?: boolean;
    children: Snippet;
  }

  let { variant = "secondary", icon = false, small = false, type = "button", children, ...buttonAttributes }: Props = $props();
</script>

<button class={variant} class:icon class:small {type} {...buttonAttributes}>
  {@render children()}
</button>

<style>
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2.75rem;
    padding: 0.5rem 1.125rem;
    border: var(--rule-row);
    border-radius: 0;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
    cursor: pointer;
    transition:
      transform var(--duration-quick) var(--ease-out),
      box-shadow var(--duration-quick) var(--ease-out);

    &:active:not(:disabled) {
      transform: none;
      box-shadow: none;
    }

    &:disabled {
      opacity: 0.45;
      cursor: default;
    }
  }

  .primary {
    background: var(--ink);
    color: var(--paper);
  }

  .destructive {
    border-color: var(--red-text);
    color: var(--red-text);
  }

  .small {
    min-height: 2.25rem;
    padding: 0.25rem 0.75rem;
    font-size: 0.9375rem;
  }

  .icon {
    padding: 0.5rem;

    :global(svg) {
      width: 1lh;
      height: 1lh;
    }
  }

  @media (hover: hover) {
    button:hover:not(:disabled) {
      transform: translate(-2px, -2px);
      box-shadow: 2px 2px 0 var(--ink);
    }
  }
</style>
