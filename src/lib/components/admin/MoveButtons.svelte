<script lang="ts">
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import Button from "$lib/components/form/Button.svelte";

  interface Props {
    formaction: string;
    first: boolean;
    last: boolean;
  }

  let { formaction, first, last }: Props = $props();
</script>

<Button type="submit" {formaction} name="direction" value="up" disabled={first} icon aria-label="Move up"><ArrowUp /></Button>
<Button type="submit" {formaction} name="direction" value="down" disabled={last} icon aria-label="Move down"><ArrowDown /></Button>
