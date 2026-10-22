<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Field from "$lib/components/form/Field.svelte";
  import ImagePicker from "./ImagePicker.svelte";

  type Props = ComponentProps<typeof Field>;

  let fieldProps: Props = $props();

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
  </div>
</div>

<style>
  .image-field {
    display: grid;
    gap: var(--space-1);
    min-width: 0;
  }

  .choose {
    justify-self: start;
  }
</style>
