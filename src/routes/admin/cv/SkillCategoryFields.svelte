<script lang="ts">
  import Field from "$lib/components/form/Field.svelte";

  interface Props {
    values: Record<string, string>;
    errors?: Record<string, string[] | undefined>;
  }

  let { values, errors }: Props = $props();
</script>

<Field label="Category" name="category" value={values.category ?? ""} error={errors?.category?.[0]} />
<Field label="Skills" name="items" multiline hint="One per line" value={values.items ?? ""} error={errors?.items?.[0]} />
