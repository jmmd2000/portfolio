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
    display: grid;
    gap: var(--space-1);
    max-width: 62ch;
    margin: var(--space-2) 0 0;
    padding: 0;
    list-style: none;

    li {
      position: relative;
      padding-left: 1.25em;
      line-height: 1.55;

      &::before {
        content: "";
        position: absolute;
        top: 0.6em;
        left: 0;
        width: 0.45em;
        height: 0.45em;
        background: var(--red);
      }
    }
  }
</style>
