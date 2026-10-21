<script lang="ts">
  import Button from "$lib/components/form/Button.svelte";

  interface Props {
    formaction: string;
    first: boolean;
    last: boolean;
  }

  let { formaction, first, last }: Props = $props();
</script>

<Button type="submit" {formaction} name="direction" value="up" disabled={first} small aria-label="Move up">Up</Button>
<Button type="submit" {formaction} name="direction" value="down" disabled={last} small aria-label="Move down">Down</Button>
