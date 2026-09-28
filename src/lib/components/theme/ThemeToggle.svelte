<script lang="ts">
  import { onMount } from "svelte";
  import { getCurrentTheme, setTheme, watchOperatingSystemTheme, type Theme } from "./theme";

  let currentTheme = $state<Theme>("light");
  let otherTheme = $derived<Theme>(currentTheme === "dark" ? "light" : "dark");

  onMount(() => {
    currentTheme = getCurrentTheme();

    return watchOperatingSystemTheme(() => {
      currentTheme = getCurrentTheme();
    });
  });

  function switchTheme(): void {
    setTheme(otherTheme);
    currentTheme = otherTheme;
  }
</script>

<button type="button" class="theme-toggle" aria-label="Switch to {otherTheme} theme" onclick={switchTheme}>
  {otherTheme === "dark" ? "Dark" : "Light"}
</button>

<style>
  .theme-toggle {
    padding: 0;
    border: 0;
    border-bottom: var(--border-thick) solid transparent;
    background: none;
    color: var(--colour-text-muted);
    font: inherit;
    font-size: var(--font-size-2);
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .theme-toggle:hover {
    color: var(--colour-foreground);
  }
</style>
