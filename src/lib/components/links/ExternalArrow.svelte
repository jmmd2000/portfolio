<script lang="ts">
  import ArrowUpRight from "@lucide/svelte/icons/arrow-up-right";
</script>

<span class="arrow" aria-hidden="true"><ArrowUpRight size="1em" strokeWidth={2} /></span>

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

  :global(a:focus-visible) .arrow {
    transform: translate(2px, -2px);
    color: var(--colour-accent);
  }

  @media (hover: hover) {
    :global(a:hover) .arrow {
      transform: translate(2px, -2px);
      color: var(--colour-accent);
    }
  }

  @media print {
    .arrow {
      display: none;
    }
  }
</style>
