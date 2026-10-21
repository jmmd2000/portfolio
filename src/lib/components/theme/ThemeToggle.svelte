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

<!-- Both words render and the CSS shows one, so the server's HTML already shows the right word for the theme -->
<button type="button" class="theme-toggle" aria-label="Switch to {otherTheme} theme" onclick={switchTheme}>
  <span class="to-dark">Dark</span>
  <span class="to-light">Light</span>
</button>

<style>
  .theme-toggle {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    text-transform: inherit;
    text-decoration: underline;
    text-decoration-color: transparent;
    text-decoration-thickness: 3px;
    text-underline-offset: 5px;
    cursor: pointer;
    transition: text-decoration-color var(--duration-quick) var(--ease-out);
  }

  .to-light {
    display: none;
  }

  :global(:root[data-theme="dark"]) {
    .to-dark {
      display: none;
    }

    .to-light {
      display: inline;
    }
  }

  @media (prefers-color-scheme: dark) {
    :global(:root:not([data-theme="light"])) {
      .to-dark {
        display: none;
      }

      .to-light {
        display: inline;
      }
    }
  }

  @media (hover: hover) {
    .theme-toggle:hover {
      text-decoration-color: var(--red);
    }
  }

  @media (hover: none) {
    .theme-toggle {
      padding-block: var(--space-1);
    }
  }
</style>
