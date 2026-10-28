<script lang="ts">
  import type { ComponentProps, Snippet } from "svelte";
  import Field from "$lib/components/form/Field.svelte";
  import ImagePicker from "./ImagePicker.svelte";

  type Props = ComponentProps<typeof Field> & {
    /** More ways to find an image, shown after Choose image. It gets the function that fills the field */
    tools?: Snippet<[fill: (url: string) => void]>;
  };

  let { tools, ...fieldProps }: Props = $props();

  let wrapper = $state<HTMLDivElement>();

  /** Puts the picked address in the field and tells the form, as typing would, so previews and unsaved checks follow */
  function fill(url: string): void {
    const input = wrapper?.querySelector("input");
    if (!input) return;

    input.value = url;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
</script>

<div class="image-field" bind:this={wrapper}>
  <Field {...fieldProps} />
  <div class="choose">
    <ImagePicker onpick={fill} small />
    {@render tools?.(fill)}
  </div>
</div>

<style>
  .image-field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .choose {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
    justify-self: start;
  }
</style>
