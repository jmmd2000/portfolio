<script lang="ts">
  import "../app.css";
  import { page } from "$app/state";
  import Footer from "$lib/components/navigation/Footer.svelte";
  import Nav from "$lib/components/navigation/Nav.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <title>James Doyle</title>
</svelte:head>

<div class="page">
  <Nav currentPath={page.url.pathname} />
  <main>
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .page {
    max-width: var(--page-width);
    margin: 0 auto;
    padding: 0 var(--page-gutter);
  }

  main {
    animation: enter var(--duration-entrance) var(--ease-out) both;
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
  }
</style>
