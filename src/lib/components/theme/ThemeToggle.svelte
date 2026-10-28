<script lang="ts">
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
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

<!-- Both icons render and the CSS shows one, so the server's HTML already shows the right icon for the theme -->
<button type="button" class="theme-toggle" aria-label="Switch to {otherTheme} theme" onclick={switchTheme}>
  <span class="to-dark"><Moon size="1.25rem" strokeWidth={2.25} aria-hidden="true" /></span>
  <span class="to-light"><Sun size="1.25rem" strokeWidth={2.25} aria-hidden="true" /></span>
</button>

<style>
  .theme-toggle {
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    cursor: pointer;
    transition: color var(--duration-quick) var(--ease-out);
  }

  .to-dark {
    display: grid;
  }

  .to-light {
    display: none;
  }

  :global(:root[data-theme="dark"]) {
    .to-dark {
      display: none;
    }

    .to-light {
      display: grid;
    }
  }

  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme="light"])) {
      .to-dark {
        display: none;
      }

      .to-light {
        display: grid;
      }
    }
  }

  @media (hover: hover) {
    .theme-toggle:hover {
      color: var(--red);
    }
  }

  @media (hover: none) {
    .theme-toggle {
      width: 2.75rem;
      height: 2.75rem;
    }
  }
</style>
