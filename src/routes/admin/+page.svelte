<script lang="ts">
  import { resolve } from "$app/paths";
  import Button from "$lib/components/form/Button.svelte";
  import PageHead from "$lib/components/head/PageHead.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageHead title="Admin" description="The site's admin." noindex />

<section>
  <h1>Admin</h1>
  <p>Signed in as {data.email}.</p>
  <a href={resolve("/admin/profile")}>Profile</a>
  <a href={resolve("/admin/socials")}>Socials</a>
  <a href={resolve("/admin/cv")}>CV</a>
  <a href={resolve("/admin/projects")}>Projects</a>
  <a href={resolve("/admin/password")}>Change password</a>

  <form method="POST" action="/admin/logout">
    <Button type="submit">Log out</Button>
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
</style>
