<script lang="ts">
  import "../app.css";
  import ThemeToggle from "$lib/components/theme/ThemeToggle.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <title>James Doyle</title>
</svelte:head>

<header>
  <ThemeToggle />
</header>

{@render children()}
