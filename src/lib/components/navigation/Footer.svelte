<script lang="ts">
  import { linkText } from "$lib/components/contact/linkText";
  import type { Social } from "$lib/server/content/socials";

  interface Props {
    socials: Social[];
    /** Left out when null */
    visitorCount: number | null;
  }

  let { socials, visitorCount }: Props = $props();

  let emailSocial = $derived(socials.find(social => social.url.startsWith("mailto:")));
  let otherSocials = $derived(socials.filter(social => social !== emailSocial));
</script>

<footer>
  <div class="row">
    <div class="links">
      {#if emailSocial}
        <a class="email label" href={emailSocial.url} rel="external">{linkText(emailSocial.url)}</a>
      {/if}
      <ul class="socials label">
        {#each otherSocials as social (social.id)}
          <li><a href={social.url} rel="external">{social.name}</a></li>
        {/each}
      </ul>
    </div>
    {#if visitorCount !== null}
      <p class="visitors label">You are visitor {visitorCount.toLocaleString("en-GB")}</p>
    {/if}
  </div>
</footer>

<style>
  /* The footer swaps in the band's colours, so every link, outline and button inside it reads on the dark band */
  footer {
    --ink: var(--band-ink);
    --muted: var(--band-muted);
    --red: var(--band-red);
    --red-text: var(--band-red);

    padding: var(--space-4) var(--page-padding) var(--space-5);
    border-top: var(--rule-section);
    background: var(--band);
    color: var(--ink);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2) var(--space-3);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2) var(--space-3);
  }

  .visitors {
    margin: 0;
    color: var(--muted);
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
