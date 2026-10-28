<script lang="ts">
  import LockKeyhole from "@lucide/svelte/icons/lock-keyhole";
  import { resolve } from "$app/paths";
  import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";
  import { isCurrentPage, shownNavigationLinks } from "./navigation";

  interface Props {
    /** The page's path, or null when no nav link should show as the current page */
    currentPath: string | null;
    hasArticles: boolean;
  }

  let { currentPath, hasArticles }: Props = $props();

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
  <span class="icons">
    <ThemeToggle />
    <a class="admin" href={resolve("/admin")} aria-label="Admin"><LockKeyhole size="1.25rem" strokeWidth={2.25} aria-hidden="true" /></a>
  </span>
</nav>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
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

  .icons {
    display: inline-flex;
    gap: var(--space-1);
  }

  .admin {
    display: inline-grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    transition: color var(--duration-quick) var(--ease-out);
  }

  @media (hover: hover) {
    a:hover {
      text-decoration-color: var(--red);
    }

    .admin:hover {
      color: var(--red);
    }
  }

  @media (hover: none) {
    a {
      padding-block: var(--space-1);
    }

    .admin {
      width: 2.75rem;
      height: 2.75rem;
    }
  }

  @media (max-width: 30rem) {
    nav {
      gap: var(--space-1) var(--space-2);
    }
  }
</style>
