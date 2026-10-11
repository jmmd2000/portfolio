<script lang="ts">
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";

  interface Props {
    /** An up-right arrow for a link to another site, a right arrow for a page on this one */
    kind: "external" | "internal";
  }

  let { kind }: Props = $props();
</script>

<span class="arrow {kind}" aria-hidden="true">
  {#if kind === "external"}
    <ArrowUpRight size="1em" strokeWidth={2} />
  {:else}
    <ArrowRight size="1em" strokeWidth={2} />
  {/if}
</span>

<style>
  /* A margin instead of a space, so the link's underline stops at the text */
  .arrow {
    display: inline-block;
    margin-inline-start: 0.25em;
    color: var(--colour-text-muted);
    vertical-align: -0.125em;
    transition:
      transform 250ms var(--ease-out),
      color 250ms var(--ease-out);
  }

  :global(a:focus-visible) .external {
    transform: translate(2px, -2px);
  }

  :global(a:focus-visible) .internal {
    transform: translateX(3px);
  }

  :global(a:focus-visible) .arrow {
    color: var(--colour-accent);
  }

  @media (hover: hover) {
    :global(a:hover) .external {
      transform: translate(2px, -2px);
    }

    :global(a:hover) .internal {
      transform: translateX(3px);
    }

    :global(a:hover) .arrow {
      color: var(--colour-accent);
    }
  }

  @media print {
    .arrow {
      display: none;
    }
  }
</style>
