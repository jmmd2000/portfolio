<script lang="ts">
  import { editProfile } from "$lib/components/profile/editProfile";
  import type { Profile } from "$lib/server/content/profile";

  interface Props {
    profile: Profile;
    signedIn: boolean;
  }

  let { profile, signedIn }: Props = $props();
</script>

<header class="slab">
  <h1 {@attach signedIn && editProfile("name")}>{profile.name}</h1>
  <p class="role" {@attach signedIn && editProfile("role")}>{profile.role}</p>
  <p class="meta"><span {@attach signedIn && editProfile("location")}>{profile.location}</span></p>
</header>

<style>
  .slab {
    margin-top: var(--space-4);
    padding: calc(var(--space-panel) * 2);
    background: var(--colour-orange);
    color: var(--colour-text-on-orange);
  }

  h1 {
    /* min-content puts each word of the name on its own line */
    width: min-content;
    color: var(--colour-text-on-orange);
    font-size: var(--font-size-hero);
    font-weight: 800;
    font-stretch: 84%;
    letter-spacing: -0.05em;
    text-transform: uppercase;
  }

  .role {
    margin-top: var(--space-2);
    font-size: var(--font-size-5);
    font-weight: 500;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-top: var(--space-5);
    font-size: var(--font-size-2);
    font-weight: 500;

    &::before {
      content: "";
      width: 0.5rem;
      height: 0.5rem;
      background: currentColor;
    }
  }
</style>
