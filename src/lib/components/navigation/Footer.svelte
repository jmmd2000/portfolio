<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";
  import { editProfile } from "$lib/components/profile/editProfile";
  import type { Social } from "$lib/server/content/profile";

  interface Props {
    location: string;
    socials: Social[];
    signedIn: boolean;
  }

  let { location, socials, signedIn }: Props = $props();

  let editingLinks = $state(false);
</script>

{#snippet links()}
  <ul class="socials">
    {#each socials as social (social.id)}
      <li><a href={social.url} rel="external">{social.name}</a></li>
    {/each}
  </ul>
{/snippet}

<footer>
  <span {@attach signedIn && editProfile("location")}>{location}</span>
  {#if signedIn && editingLinks}
    {#await import("$lib/components/socials/SocialsEditor.svelte")}
      {@render links()}
    {:then { default: SocialsEditor }}
      <SocialsEditor {socials} />
    {/await}
  {:else}
    {@render links()}
  {/if}
  {#if signedIn}
    <div class="edit-toggle" class:open={editingLinks}>
      <Button compact onclick={() => (editingLinks = !editingLinks)}>{editingLinks ? "Done" : "Edit links"}</Button>
    </div>
  {/if}
</footer>

<style>
  footer {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--space-3);
    margin-top: var(--space-8);
    padding: var(--space-3) 0 var(--space-6);
    border-top: var(--border-thick) solid var(--colour-foreground);
    color: var(--colour-text-muted);
    font-size: var(--font-size-2);
  }

  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;

    a {
      border-bottom: var(--border-thick) solid transparent;
      color: var(--colour-teal);
      font-weight: 600;
      text-decoration: none;
      transition: border-color var(--duration-quick) var(--ease-out);

      &:hover {
        border-bottom-color: var(--colour-teal);
      }
    }
  }

  .edit-toggle {
    position: absolute;
    right: 0;
    bottom: var(--space-2);
  }

  /* On a mouse it waits for hover or focus. On a touch screen it always shows */
  @media (hover: hover) {
    .edit-toggle {
      opacity: 0;
      transition: opacity var(--duration-quick) var(--ease-out);
    }

    .open,
    footer:hover .edit-toggle,
    footer:focus-within .edit-toggle {
      opacity: 1;
    }
  }

  @media print {
    footer {
      display: none;
    }
  }
</style>
