<script lang="ts">
  import { fitText } from "$lib/attachments/fitText";
  import { linkText } from "$lib/components/contact/linkText";
  import type { Profile } from "$lib/server/content/profile";
  import type { Social } from "$lib/server/content/socials";
  import { siteURL } from "$lib/site";

  interface Props {
    profile: Profile;
    socials: Social[];
  }

  let { profile, socials }: Props = $props();

  const words = $derived(profile.name.split(" ").filter(word => word !== ""));
</script>

<header class="masthead">
  <!-- The spaces between the parts keep the name readable when copied or read from a PDF. The layout ignores them -->
  <h1 class="fitted-line" {@attach fitText(10)}>
    {#each words as word, index (index)}{index > 0 ? " " : ""}<span class="part">{word}</span>{/each}
  </h1>
  <div class="row">
    <p class="role">{profile.role}</p>
    <ul class="contact">
      <li>{profile.location}</li>
      {#each socials as social (social.id)}
        <li><a href={social.url} rel="external">{linkText(social.url)}</a></li>
      {/each}
      <li class="site">{linkText(siteURL)}</li>
    </ul>
  </div>
</header>

<style>
  .masthead {
    padding: var(--space-3) var(--page-padding) var(--space-4);
    border-bottom: var(--rule-section);
  }

  h1 {
    margin-bottom: var(--space-3);
    /* Close to the fitted size, so the name barely moves when fitText runs */
    font-size: min(10rem, 26vw);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: end;
    gap: var(--space-3);
  }

  .role {
    font-size: var(--type-label);
    font-weight: 500;
    line-height: 1.3;
  }

  .contact {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin: 0;
    padding: 0;
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
    list-style: none;

    a {
      color: var(--ink);
    }
  }

  .site {
    display: none;
  }

  @media (hover: none) {
    .contact a {
      display: inline-block;
      padding-block: var(--space-1);
    }
  }

  @media print {
    .contact a {
      text-decoration: none;
    }

    .site {
      display: list-item;
    }
  }
</style>
