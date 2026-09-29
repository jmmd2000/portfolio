<script lang="ts">
  import type { Profile, Social } from "$lib/server/content/profile";
  import { buildPersonStructuredData, jsonLDScriptTag } from "./structuredData";

  interface Props {
    profile: Profile;
    socials: Social[];
  }

  let { profile, socials }: Props = $props();

  const scriptTag = $derived(jsonLDScriptTag(buildPersonStructuredData(profile, socials)));
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -- the JSON inside is escaped by toScriptJSON -->
  {@html scriptTag}
</svelte:head>
