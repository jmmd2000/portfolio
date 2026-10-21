<script lang="ts">
  import { page } from "$app/state";
  import AdminLayout from "$lib/components/admin/AdminLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { data, children }: LayoutProps = $props();
</script>

<AdminLayout currentPath={page.url.pathname} signedIn={data.signedIn}>
  {@render children()}
</AdminLayout>
