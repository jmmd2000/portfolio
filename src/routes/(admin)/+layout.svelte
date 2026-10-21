<script lang="ts">
  import { page } from "$app/state";
  import SiteLayout from "$lib/components/layout/SiteLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<SiteLayout currentPath={page.url.pathname} socials={data.socials} hasArticles={data.hasArticles} profile={data.profile}>
  {@render children()}
</SiteLayout>
