<script lang="ts">
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Admin" description="The site's admin." noindex />

<section>
  <h1>Admin</h1>
  <p>Signed in as {data.email}.</p>

  <form method="POST" action="/admin/logout">
    <button type="submit">Log out</button>
  </form>
</section>

<style>
  section {
    display: grid;
    gap: var(--space-4);
    justify-items: start;
    padding-top: var(--space-5);
  }

  h1 {
    font-size: var(--font-size-page-title);
    font-weight: 800;
    font-stretch: 90%;
  }

  button {
    padding: var(--space-1) var(--space-3);
    border: var(--border-thick) solid var(--colour-foreground);
    border-radius: 0;
    background: var(--colour-background);
    color: var(--colour-foreground);
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
</style>
