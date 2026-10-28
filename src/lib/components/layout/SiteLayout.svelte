<script lang="ts">
  import type { Snippet } from "svelte";
  import { resolve } from "$app/paths";
  import HomeHeader from "$lib/components/home/HomeHeader.svelte";
  import Footer from "$lib/components/navigation/Footer.svelte";
  import Nav from "$lib/components/navigation/Nav.svelte";
  import type { Profile } from "$lib/server/content/profile";
  import type { Social } from "$lib/server/content/socials";
  import { siteName } from "$lib/site";

  interface Props {
    /** The page's path, so the nav marks it. Null marks none */
    currentPath: string | null;
    socials: Social[];
    hasArticles: boolean;
    /** Needed on the home page, which shows the name and intro under the bar */
    profile?: Profile;
    /** The footer leaves the count out when this is missing or null */
    visitorCount?: number | null;
    children: Snippet;
  }

  let { currentPath, socials, hasArticles, profile, visitorCount = null, children }: Props = $props();

  const isHome = $derived(currentPath === "/");
</script>

<div class="site">
  <a class="skip-link label" href="#main">Skip to content</a>
  <!-- The home page leaves the name out of the bar, since its header shows the name just below -->
  <header class="bar" class:home-bar={isHome}>
    {#if !isHome}
      <a class="home label" href={resolve("/")}>{siteName}</a>
    {/if}
    <Nav {currentPath} {hasArticles} />
  </header>
  <main id="main">
    {#if isHome && profile}
      <HomeHeader {profile} />
    {/if}
    {@render children()}
  </main>
  <Footer {socials} {isHome} {visitorCount} />
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
    padding: var(--space-2) var(--page-padding);
    border-bottom: var(--rule-section);
  }

  .home-bar {
    justify-content: flex-end;
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
