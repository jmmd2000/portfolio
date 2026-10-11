<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = HTMLInputAttributes & {
    label: string;
  };

  let { label, checked = false, ...inputAttributes }: Props = $props();
</script>

<label>
  <input type="checkbox" {checked} defaultChecked={checked} {...inputAttributes} />
  {label}
</label>

<style>
  label {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--colour-foreground);
    font-weight: 500;
    cursor: pointer;
  }

  input {
    width: 1.125rem;
    height: 1.125rem;
    margin: 0;
    accent-color: var(--colour-accent);
    cursor: pointer;
  }
</style>
