<script lang="ts">
  import type { Snippet } from "svelte";
  import Footer from "$lib/components/navigation/Footer.svelte";
  import Nav from "$lib/components/navigation/Nav.svelte";
  import type { Social } from "$lib/server/content/socials";

  interface Props {
    /** The page's path, so the nav marks it. Null marks none */
    currentPath: string | null;
    socials: Social[];
    signedIn: boolean;
    hasArticles: boolean;
    children: Snippet;
  }

  let { currentPath, socials, signedIn, hasArticles, children }: Props = $props();
</script>

<div class="site">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="inner">
    <Nav {currentPath} {signedIn} {hasArticles} />
  </div>
  <main id="main" class="inner">
    {@render children()}
  </main>
  <Footer {socials} {signedIn} />
</div>

<style>
  .site {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }

  .inner {
    width: 100%;
    max-width: var(--page-width);
    margin-inline: auto;
    padding-inline: var(--page-gutter);
  }

  main {
    flex: 1;
  }

  .skip-link {
    position: absolute;
    inset-inline-start: var(--space-4);
    inset-block-start: var(--space-4);
    z-index: 20;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-medium);
    background: var(--colour-foreground);
    color: var(--colour-background);
    font-weight: 500;
    text-decoration: none;
    transform: translateY(-200%);

    &:focus-visible {
      transform: none;
    }
  }
</style>
