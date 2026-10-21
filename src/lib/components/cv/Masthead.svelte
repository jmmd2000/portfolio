<script lang="ts">
  import { linkText } from "$lib/components/contact/linkText";
  import type { Profile } from "$lib/server/content/profile";
  import type { Social } from "$lib/server/content/socials";
  import { siteURL } from "$lib/site";

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
    <li class="location">{profile.location}</li>
    {#each socials as social (social.id)}
      <li><a href={social.url} rel="external">{linkText(social.url)}</a></li>
    {/each}
    <li class="site">{linkText(siteURL)}</li>
  </ul>
</header>

<style>
  .masthead {
    display: grid;
    gap: var(--old-space-5) var(--old-space-7);
    padding-block: var(--old-space-7) 0;

    @media (min-width: 44rem) {
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
    }

    h1 {
      font-size: var(--font-size-page-title);
      line-height: 1.05;
    }
  }

  .role {
    margin-top: var(--old-space-3);
    color: var(--colour-text);
    font-size: var(--font-size-title);
    font-weight: 450;
  }

  .contact {
    margin: 0;
    padding: 0;
    font-size: var(--font-size-label);
    list-style: none;

    li + li {
      margin-top: var(--old-space-1);
    }

    a {
      font-weight: 500;
    }
  }

  .location {
    color: var(--colour-text-muted);
  }

  .site {
    display: none;
  }

  @media (hover: none) {
    .contact a {
      display: inline-block;
      margin-block: calc(-1 * var(--old-space-3));
      padding-block: var(--old-space-3);
    }
  }

  @media (max-width: 52rem) {
    .masthead {
      padding-block-start: var(--old-space-6);
    }
  }

  @media print {
    .masthead {
      padding: 0;
    }

    .contact a {
      text-decoration: none;
    }

    .site {
      display: list-item;
    }
  }
</style>
