<script lang="ts">
  import { resolve } from "$app/paths";
  import { fitText } from "$lib/attachments/fitText";
  import CopyButton from "$lib/components/contact/CopyButton.svelte";
  import { linkText } from "$lib/components/contact/linkText";
  import type { Social } from "$lib/server/content/socials";

  interface Props {
    socials: Social[];
    /** The home page ends with the email filling the width and a Copy email button */
    isHome: boolean;
  }

  let { socials, isHome }: Props = $props();

  let emailSocial = $derived(socials.find(social => social.url.startsWith("mailto:")));
  let otherSocials = $derived(socials.filter(social => social !== emailSocial));
  let fittedEmail = $state<HTMLAnchorElement>();
</script>

<footer>
  {#if emailSocial && isHome}
    <a class="fitted-email fitted-line" href={emailSocial.url} rel="external" bind:this={fittedEmail} {@attach fitText(5.5)}><span class="part">{linkText(emailSocial.url)}</span></a>
  {/if}
  <div class="row">
    {#if emailSocial && isHome}
      <CopyButton text={linkText(emailSocial.url)} label="Copy email" selectTarget={fittedEmail} />
    {:else if emailSocial}
      <a class="email label" href={emailSocial.url} rel="external">{linkText(emailSocial.url)}</a>
    {/if}
    <ul class="socials label">
      {#each otherSocials as social (social.id)}
        <li><a href={social.url} rel="external">{social.name}</a></li>
      {/each}
    </ul>
    <a class="admin" href={resolve("/admin")}>Admin</a>
  </div>
</footer>

<style>
  footer {
    padding: var(--space-3) var(--page-padding) var(--space-4);
  }

  .fitted-email {
    margin-bottom: var(--space-3);
    /* Close to the fitted size, so the email barely moves when fitText runs */
    font-size: min(5.5rem, 10vw);
    text-decoration: underline;
    text-decoration-color: var(--red);
    text-decoration-thickness: 0.05em;
    text-underline-offset: 0.08em;
    transition: text-decoration-thickness var(--duration-quick) var(--ease-out);
  }

  @media (hover: hover) {
    .fitted-email:hover {
      text-decoration-thickness: 0.1em;
    }
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2) var(--space-3);
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
    .row a {
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
