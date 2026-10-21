<script lang="ts">
  import { page } from "$app/state";
  import SiteLayout from "$lib/components/layout/SiteLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<SiteLayout currentPath={page.url.pathname} socials={data.socials} signedIn={data.signedIn} hasArticles={data.hasArticles}>
  {@render children()}
</SiteLayout>
