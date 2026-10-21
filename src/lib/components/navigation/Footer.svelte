<script lang="ts">
  import { resolve } from "$app/paths";
  import { linkText } from "$lib/components/contact/linkText";
  import type { Social } from "$lib/server/content/socials";

  interface Props {
    socials: Social[];
  }

  let { socials }: Props = $props();

  let emailSocial = $derived(socials.find(social => social.url.startsWith("mailto:")));
  let otherSocials = $derived(socials.filter(social => social !== emailSocial));
</script>

<footer>
  {#if emailSocial}
    <a class="email label" href={emailSocial.url} rel="external">{linkText(emailSocial.url)}</a>
  {/if}
  <ul class="socials label">
    {#each otherSocials as social (social.id)}
      <li><a href={social.url} rel="external">{social.name}</a></li>
    {/each}
  </ul>
  <a class="admin" href={resolve("/admin")}>Admin</a>
</footer>

<style>
  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2) var(--space-3);
    padding: var(--space-3) var(--page-gutter) var(--space-4);
  }

  .email {
    overflow-wrap: anywhere;
  }

  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .admin {
    color: var(--muted);
    font-size: var(--type-small);
    font-weight: 600;
  }

  @media (hover: none) {
    footer a {
      display: inline-block;
      padding-block: var(--space-1);
    }
  }

  @media print {
    footer {
      display: none;
    }
  }
</style>
