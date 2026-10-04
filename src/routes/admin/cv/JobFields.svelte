<script lang="ts">
  import Field from "$lib/components/form/Field.svelte";

  interface Props {
    values: Record<string, string>;
    errors?: Record<string, string[] | undefined>;
  }

  let { values, errors }: Props = $props();
</script>

<Field label="Title" name="title" value={values.title ?? ""} error={errors?.title?.[0]} />
<Field label="Company" name="company" value={values.company ?? ""} error={errors?.company?.[0]} />
<Field label="Company website" name="companyURL" hint="Optional" value={values.companyURL ?? ""} error={errors?.companyURL?.[0]} />
<Field label="Location" name="location" hint="Optional" value={values.location ?? ""} error={errors?.location?.[0]} />
<div class="wide">
  <Field label="Logo URL" name="logoURL" placeholder="https://assets.jamesmddoyle.com/..." value={values.logoURL ?? ""} error={errors?.logoURL?.[0]} />
</div>
<Field label="Started" name="startDate" placeholder="2023-07" value={values.startDate ?? ""} error={errors?.startDate?.[0]} />
<Field label="Finished" name="endDate" placeholder="2024-03" hint="Leave empty if you still work here" value={values.endDate ?? ""} error={errors?.endDate?.[0]} />
<div class="wide">
  <Field label="Bullets" name="bullets" multiline hint="One per line" value={values.bullets ?? ""} error={errors?.bullets?.[0]} />
</div>
<div class="wide">
  <Field label="Tags" name="tags" multiline hint="One per line" value={values.tags ?? ""} error={errors?.tags?.[0]} />
</div>

<style>
  .wide {
    grid-column: 1 / -1;
  }
</style>
