<script lang="ts">
  import Field from "$lib/components/form/Field.svelte";

  interface Props {
    values: Record<string, string>;
    errors?: Record<string, string[] | undefined>;
  }

  let { values, errors }: Props = $props();
</script>

<div class="wide">
  <Field label="Qualification" name="degree" value={values.degree ?? ""} error={errors?.degree?.[0]} />
</div>
<Field label="Institution" name="institution" value={values.institution ?? ""} error={errors?.institution?.[0]} />
<Field label="Location" name="location" hint="Optional" value={values.location ?? ""} error={errors?.location?.[0]} />
<div class="wide">
  <Field label="Grade" name="grade" value={values.grade ?? ""} error={errors?.grade?.[0]} />
</div>
<Field label="Started" name="startYear" placeholder="2019" inputmode="numeric" value={values.startYear ?? ""} error={errors?.startYear?.[0]} />
<Field label="Finished" name="endYear" placeholder="2023" inputmode="numeric" value={values.endYear ?? ""} error={errors?.endYear?.[0]} />

<style>
  .wide {
    grid-column: 1 / -1;
  }
</style>
