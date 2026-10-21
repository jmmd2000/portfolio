<script lang="ts">
  import type { Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import Footer from "$lib/components/navigation/Footer.svelte";
  import Nav from "$lib/components/navigation/Nav.svelte";
  import type { Social } from "$lib/server/content/socials";
  import { siteName } from "$lib/site";

  interface Props {
    /** The page's path, so the nav marks it. Null marks none */
    currentPath: string | null;
    socials: Social[];
    hasArticles: boolean;
    children: Snippet;
  }

  let { currentPath, socials, hasArticles, children }: Props = $props();
</script>

<div class="site">
  <a class="skip-link label" href="#main">Skip to content</a>
  <header class="bar">
    <a class="home label" href={resolve("/")}>{siteName}</a>
    <Nav {currentPath} {hasArticles} />
  </header>
  <main id="main">
    {@render children()}
  </main>
  <Footer {socials} />
</div>

<style>
  .site {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-2) var(--space-3);
    padding: var(--space-2) var(--page-gutter);
    border-bottom: var(--rule-section);
  }

  .home {
    text-decoration: none;
  }

  main {
    flex: 1;
  }

  .skip-link {
    position: absolute;
    inset-inline-start: var(--space-2);
    inset-block-start: var(--space-2);
    z-index: 20;
    padding: var(--space-1) var(--space-2);
    background: var(--ink);
    color: var(--paper);
    text-decoration: none;
    transform: translateY(-200%);

    &:focus-visible {
      transform: none;
    }
  }

  @media print {
    .bar {
      display: none;
    }
  }
</style>
