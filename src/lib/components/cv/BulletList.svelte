<script lang="ts">
  interface Props {
    items: string[];
  }

  let { items }: Props = $props();
</script>

<ul class="bullets">
  {#each items as item, index (index)}
    <li>{item}</li>
  {/each}
</ul>

<style>
  .bullets {
    max-width: 64ch;
    margin: var(--old-space-4) 0 0;
    padding-inline-start: 1.1rem;
    list-style: disc;

    li {
      padding-inline-start: var(--old-space-1);
    }

    li + li {
      margin-top: var(--old-space-2);
    }

    li::marker {
      color: var(--colour-text-muted);
    }
  }

  @media print {
    .bullets {
      max-width: none;
      margin-top: var(--old-space-2);
      line-height: 1.45;

      li + li {
        margin-top: var(--old-space-1);
      }
    }
  }
</style>
