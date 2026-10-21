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

  // Home is the mark on the left, so it isn't repeated in the links
  const pageLinks = $derived(shownNavigationLinks(hasArticles).filter(link => link.path !== "/"));
</script>

<nav aria-label="Main">
  <a class="home" href={resolve("/")} aria-label="Home" aria-current={ariaCurrent("/")}>
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="5" fill="var(--colour-accent)" />
      <path
        fill="var(--colour-background)"
        transform="translate(4 4) scale(0.75)"
        d="M3.71 26.49 3.52 21.75Q3.76 21.79 4.03 21.79Q4.31 21.8 4.53 21.8Q5.62 21.8 6.2 21.49Q6.79 21.19 7.06 20.52Q7.33 19.86 7.33 18.77V5.5H12.36V18.94Q12.36 21.69 11.58 23.35Q10.79 25.02 9.2 25.76Q7.61 26.5 5.16 26.5Q4.93 26.5 4.64 26.5Q4.35 26.5 3.71 26.49ZM16.44 26.24V22.38H20.28Q21.39 22.38 22.12 21.66Q22.85 20.94 23.22 19.49Q23.59 18.03 23.59 15.88Q23.59 14.18 23.38 12.95Q23.17 11.71 22.76 10.91Q22.35 10.12 21.67 9.74Q20.99 9.36 20.04 9.36H16.44V5.5H19.99Q22.48 5.5 24.4 6.71Q26.33 7.92 27.4 10.24Q28.48 12.56 28.48 15.9Q28.48 18.63 27.91 20.48Q27.34 22.32 26.39 23.46Q25.44 24.6 24.35 25.2Q23.25 25.8 22.22 26.02Q21.19 26.24 20.44 26.24ZM14.03 26.24V5.5H18.89V26.24Z"
      />
    </svg>
  </a>
  <div class="links">
    {#each pageLinks as link (link.path)}
      <a class="nav-link" href={resolve(link.path)} aria-current={ariaCurrent(link.path)}>{link.label}</a>
    {/each}
    {#if signedIn}
      <a class="nav-link" href={resolve("/admin")} aria-current={ariaCurrent("/admin")}>Admin</a>
    {/if}
  </div>
  <ThemeToggle />
</nav>

<style>
  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--old-space-3) var(--old-space-5);
    padding-block: var(--old-space-5);
  }

  .home {
    display: block;
    width: 2rem;
    height: 2rem;
    transition: transform 300ms var(--ease-out);

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--old-space-2) var(--old-space-5);
    margin-inline-start: auto;
  }

  .nav-link {
    color: var(--colour-text-muted);
    font-size: var(--font-size-label);
    font-weight: 500;
    text-decoration: none;
    transition: color var(--duration-quick) var(--ease-out);

    &[aria-current="page"] {
      color: var(--colour-foreground);
      text-decoration: underline;
      text-decoration-color: var(--colour-foreground);
      text-underline-offset: 6px;
    }
  }

  @media (hover: hover) {
    .home:hover {
      transform: rotate(-6deg) scale(1.06);
    }

    .nav-link:hover {
      color: var(--colour-foreground);
    }
  }

  @media (hover: none) {
    .home {
      width: 2.75rem;
      height: 2.75rem;
      margin: -0.375rem;
      padding: 0.375rem;
    }

    .nav-link {
      padding-block: var(--old-space-3);
    }
  }

  /* On narrow screens the links get their own row under the mark and the toggle */
  @media (max-width: 52rem) {
    .links {
      order: 3;
      width: 100%;
      margin-inline-start: 0;
    }
  }

  @media print {
    nav {
      display: none;
    }
  }
</style>
