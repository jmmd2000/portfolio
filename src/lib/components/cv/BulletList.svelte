<script lang="ts">
  interface Props {
    items: string[];
  }

  let { items }: Props = $props();
</script>

<ul class="bullets">
  {#each items as item (item)}
    <li>{item}</li>
  {/each}
</ul>

<style>
  .bullets {
    display: grid;
    gap: var(--space-1);
    margin: var(--space-2) 0 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      max-width: 64ch;
      padding-left: var(--space-3);
      font-size: var(--font-size-2);

      &::before {
        content: "";
        position: absolute;
        top: 0.6em;
        left: 0;
        width: 6px;
        height: 6px;
        background: var(--colour-orange);
      }
    }
  }
</style>
