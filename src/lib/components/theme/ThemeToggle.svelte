<script lang="ts">
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import { onMount } from "svelte";
  import { getCurrentTheme, setTheme, watchOperatingSystemTheme, type Theme } from "./theme";

  let currentTheme = $state<Theme>("light");
  let otherTheme = $derived<Theme>(currentTheme === "dark" ? "light" : "dark");
  let turned = $state(false);

  onMount(() => {
    currentTheme = getCurrentTheme();

    return watchOperatingSystemTheme(() => {
      currentTheme = getCurrentTheme();
    });
  });

  function switchTheme(): void {
    setTheme(otherTheme);
    currentTheme = otherTheme;
    turned = !turned;
  }
</script>

<button type="button" class="theme-toggle" class:turned aria-label="Switch to {otherTheme} theme" onclick={switchTheme}>
  {#if currentTheme === "dark"}
    <Moon size={18} strokeWidth={1.75} aria-hidden="true" />
  {:else}
    <Sun size={18} strokeWidth={1.75} aria-hidden="true" />
  {/if}
</button>

<style>
  .theme-toggle {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 0;
    border-radius: var(--radius-medium);
    background: none;
    color: var(--colour-text-muted);
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);

    :global(svg) {
      transition: transform 500ms var(--ease-out);
    }

    &.turned :global(svg) {
      transform: rotate(90deg);
    }
  }

  @media (hover: hover) {
    .theme-toggle:hover {
      color: var(--colour-foreground);
    }
  }

  @media (hover: none) {
    .theme-toggle {
      width: 2.75rem;
      height: 2.75rem;
      margin-inline-end: -0.8125rem;
    }
  }

  @media (max-width: 52rem) {
    .theme-toggle {
      margin-inline-start: auto;
    }
  }
</style>
