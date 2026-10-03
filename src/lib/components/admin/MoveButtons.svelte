<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";

  interface Props {
    formaction: string;
    first: boolean;
    last: boolean;
  }

  let { formaction, first, last }: Props = $props();
</script>

<Button type="submit" {formaction} name="direction" value="up" disabled={first}>Move up</Button>
<Button type="submit" {formaction} name="direction" value="down" disabled={last}>Move down</Button>
