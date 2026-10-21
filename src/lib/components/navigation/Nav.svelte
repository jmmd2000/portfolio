<script lang="ts">
  import { resolve } from "$app/paths";
  import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
  import { isCurrentPage, shownNavigationLinks } from "./navigation";

  interface Props {
    /** The page's path, or null when no nav link should show as the current page */
    currentPath: string | null;
    signedIn: boolean;
    hasArticles: boolean;
  }

  let { currentPath, signedIn, hasArticles }: Props = $props();

  function ariaCurrent(linkPath: string): "page" | undefined {
    if (currentPath === null) return undefined;
    return isCurrentPage(linkPath, currentPath) ? "page" : undefined;
  }

  // The name in the bar links home, so Home isn't repeated in the links
  const pageLinks = $derived(shownNavigationLinks(hasArticles).filter(link => link.path !== "/"));
</script>

<nav class="label" aria-label="Main">
  {#each pageLinks as link (link.path)}
    <a href={resolve(link.path)} aria-current={ariaCurrent(link.path)}>{link.label}</a>
  {/each}
  {#if signedIn}
    <a href={resolve("/admin")} aria-current={ariaCurrent("/admin")}>Admin</a>
  {/if}
  <ThemeToggle />
</nav>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: var(--space-1) var(--space-3);
  }

  a {
    text-decoration-color: transparent;
    transition: text-decoration-color var(--duration-quick) var(--ease-out);

    &[aria-current="page"] {
      text-decoration-color: var(--red);
      text-decoration-thickness: 6px;
    }
  }

  @media (hover: hover) {
    a:hover {
      text-decoration-color: var(--red);
    }
  }

  @media (hover: none) {
    a {
      padding-block: var(--space-1);
    }
  }

  @media (max-width: 30rem) {
    nav {
      gap: var(--space-1) var(--space-2);
    }
  }
</style>
