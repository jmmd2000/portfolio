<script lang="ts">
  import Checkbox from "$lib/components/form/Checkbox.svelte";
  import Field from "$lib/components/form/Field.svelte";
  import ImageField from "$lib/components/images/ImageField.svelte";

  interface Props {
    values: Record<string, string>;
    errors?: Record<string, string[] | undefined>;
  }

  let { values, errors }: Props = $props();
</script>

<Field label="Label" name="label" placeholder="Listening" value={values.label ?? ""} error={errors?.label?.[0]} />
<Field label="Title" name="title" value={values.title ?? ""} error={errors?.title?.[0]} />
<Field label="Subtitle" name="subtitle" hint="Optional, such as the artist or author" value={values.subtitle ?? ""} error={errors?.subtitle?.[0]} />
<Field label="Link" name="url" hint="Optional" value={values.url ?? ""} error={errors?.url?.[0]} />
<div class="wide">
  <ImageField label="Cover URL" name="imageURL" hint="Optional. Shown at its own shape, never cropped" value={values.imageURL ?? ""} error={errors?.imageURL?.[0]} />
</div>
<div class="wide">
  <Checkbox label="Shown on the home page" name="shown" checked={values.shown === "on"} />
  <p class="hint">The home page shows the first four</p>
</div>

<style>
  .hint {
    margin-top: var(--space-1);
    color: var(--muted);
    font-size: 0.875rem;
  }
</style>
