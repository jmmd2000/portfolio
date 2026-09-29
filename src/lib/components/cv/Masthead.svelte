<script lang="ts">
  import { linkText } from "$lib/components/contact/linkText";
  import type { Profile, Social } from "$lib/server/content/profile";

  interface Props {
    profile: Profile;
    socials: Social[];
  }

  let { profile, socials }: Props = $props();
</script>

<header class="masthead">
  <div>
    <h1>{profile.name}</h1>
    <p class="role">{profile.role}</p>
  </div>
  <ul class="contact">
    <li>{profile.location}</li>
    {#each socials as social (social.id)}
      <li><a href={social.url} rel="external">{linkText(social.url)}</a></li>
    {/each}
  </ul>
</header>

<style>
  .masthead {
    display: grid;
    gap: var(--space-3);
    margin-top: var(--space-4);
    padding: var(--space-5);
    background: var(--colour-foreground);
    color: var(--colour-text-on-foreground);

    @media (min-width: 44rem) {
      grid-template-columns: 1fr auto;
      align-items: end;
    }

    h1 {
      color: var(--colour-text-on-foreground);
      font-size: var(--font-size-page-title);
      font-weight: 800;
      font-stretch: 88%;
      text-transform: uppercase;
    }
  }

  .role {
    margin-top: var(--space-1);
    color: var(--colour-text-on-foreground-muted);
  }

  .contact {
    margin: 0;
    padding: 0;
    color: var(--colour-text-on-foreground-muted);
    font-family: var(--font-mono);
    font-size: var(--font-size-1);
    list-style: none;

    a {
      border-bottom: var(--border-thin) solid var(--colour-text-on-foreground-muted);
      color: var(--colour-text-on-foreground);
      text-decoration: none;
    }
  }
</style>
