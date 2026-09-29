<script lang="ts">
  import type { Social } from "$lib/server/content/profile";

  interface Props {
    location: string;
    socials: Social[];
  }

  let { location, socials }: Props = $props();
</script>

<footer>
  <span>{location}</span>
  <ul class="socials">
    {#each socials as social (social.id)}
      <li><a href={social.url} rel="external">{social.name}</a></li>
    {/each}
  </ul>
</footer>

<style>
  footer {
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

  @media print {
    footer {
      display: none;
    }
  }
</style>
