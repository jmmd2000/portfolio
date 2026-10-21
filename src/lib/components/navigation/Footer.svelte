<script lang="ts">
  import { resolve } from "$app/paths";
  import CopyButton from "$lib/components/contact/CopyButton.svelte";
  import { linkText } from "$lib/components/contact/linkText";
  import type { Social } from "$lib/server/content/socials";

  interface Props {
    socials: Social[];
    signedIn: boolean;
  }

  let { socials, signedIn }: Props = $props();

  let emailSocial = $derived(socials.find(social => social.url.startsWith("mailto:")));
  let otherSocials = $derived(socials.filter(social => social !== emailSocial));
  let emailLink = $state<HTMLAnchorElement>();
</script>

<footer>
  <div class="inner">
    {#if emailSocial}
      <p class="hello">Say hello</p>
      <div class="email-row">
        <a class="email" href={emailSocial.url} rel="external" bind:this={emailLink}>{linkText(emailSocial.url)}</a>
        <CopyButton text={linkText(emailSocial.url)} selectTarget={emailLink} />
      </div>
    {/if}
    <div class="footer-row">
      <ul class="socials">
        {#each otherSocials as social (social.id)}
          <li><a href={social.url} rel="external">{social.name}</a></li>
        {/each}
      </ul>
      {#if !signedIn}
        <a class="log-in" href={resolve("/admin/login")}>Log in</a>
      {/if}
    </div>
  </div>
</footer>

<style>
  footer {
    margin-top: var(--old-space-8);
    padding-block: var(--old-space-7) var(--old-space-6);
    background: var(--colour-deep);
    color: var(--colour-text-on-deep-muted);

    :global(:focus-visible) {
      outline-color: var(--colour-text-on-deep);
    }
  }

  .inner {
    width: 100%;
    max-width: var(--page-width);
    margin-inline: auto;
    padding-inline: var(--page-gutter);
  }

  .hello {
    margin-bottom: var(--old-space-3);
    color: var(--colour-text-on-deep);
    font-size: var(--font-size-heading);
    font-weight: 620;
    font-stretch: var(--font-stretch-heading);
  }

  .email-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--old-space-3) var(--old-space-5);
  }

  .email {
    color: var(--colour-text-on-deep);
    font-size: clamp(1.75rem, 5vw, 3.5rem);
    font-weight: 600;
    font-stretch: var(--font-stretch-heading);
    line-height: 1.1;
    letter-spacing: -0.01em;
    overflow-wrap: anywhere;
    text-decoration-color: transparent;
    text-decoration-thickness: 3px;
    text-underline-offset: 8px;
    transition: text-decoration-color 200ms var(--ease-out);
  }

  .footer-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--old-space-4) var(--old-space-6);
    margin-top: var(--old-space-7);
    font-size: var(--font-size-label);
  }

  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: var(--old-space-2) var(--old-space-5);
    margin: 0;
    padding: 0;
    list-style: none;

    a {
      color: var(--colour-text-on-deep);
      font-weight: 500;
      text-decoration: none;
      transition: opacity var(--duration-quick) var(--ease-out);
    }
  }

  .log-in {
    color: var(--colour-text-on-deep-muted);
    font-size: 0.875rem;
    text-decoration: none;
  }

  @media (hover: hover) {
    .email:hover {
      text-decoration-color: var(--colour-text-on-deep-muted);
    }

    .socials a:hover {
      opacity: 0.75;
    }

    .log-in:hover {
      color: var(--colour-text-on-deep);
    }
  }

  @media (hover: none) {
    .socials a,
    .log-in {
      display: inline-block;
      padding-block: var(--old-space-3);
    }
  }

  @media (max-width: 52rem) {
    footer {
      margin-top: var(--old-space-7);
      padding-block: var(--old-space-6) var(--old-space-5);
    }

    .footer-row {
      margin-top: var(--old-space-6);
    }
  }

  @media print {
    footer {
      display: none;
    }
  }
</style>
