<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import SiteLayout from "$lib/components/layout/SiteLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();

  // The layout stays loaded as the visitor moves between pages, so this counts each visit once
  onMount(() => {
    fetch("/api/visits", { method: "POST" }).catch(() => {});
  });
</script>

<SiteLayout currentPath={page.url.pathname} socials={data.socials} hasArticles={data.hasArticles} profile={data.profile} visitorCount={data.visitorCount}>
  {@render children()}
</SiteLayout>
