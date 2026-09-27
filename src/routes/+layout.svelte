<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <title>James Doyle</title>
</svelte:head>

{@render children()}