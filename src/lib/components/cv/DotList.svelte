<script lang="ts">
  interface Props {
    items: string[];
  }

  let { items }: Props = $props();

  // A no-break space ties the dot to the item before it, and the normal space after it is where a line can break
  const separator = " · ";
</script>

{#each items as item, index (index)}<span class="item">{item}</span>{index < items.length - 1 ? separator : ""}{/each}

<style>
  .item {
    white-space: nowrap;
  }
</style>
