<script lang="ts">
  interface Props {
    text: string;
    /** Selected instead when the clipboard is blocked, so the visitor can copy it themselves */
    selectTarget?: HTMLElement;
  }

  let { text, selectTarget }: Props = $props();

  let label = $state("Copy");
  let status = $state("");
  let resetTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    return () => clearTimeout(resetTimer);
  });

  function selectText(element: HTMLElement): void {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  async function copy(): Promise<void> {
    clearTimeout(resetTimer);
    try {
      await navigator.clipboard.writeText(text);
      label = "Copied";
      status = "Copied to the clipboard";
    } catch {
      if (selectTarget) selectText(selectTarget);
      label = "Selected";
      status = "Selected. Copy it with your keyboard.";
    }
    resetTimer = setTimeout(() => {
      label = "Copy";
      status = "";
    }, 2000);
  }
</script>

<button type="button" class="copy" onclick={copy}>{label}</button>
<span class="visually-hidden" aria-live="polite">{status}</span>

<style>
  .copy {
    min-inline-size: 6rem;
    padding: var(--old-space-2) var(--old-space-4);
    border: 1px solid color-mix(in oklch, var(--colour-text-on-deep) 55%, transparent);
    border-radius: var(--radius-medium);
    background: transparent;
    color: var(--colour-text-on-deep);
    font: inherit;
    font-size: var(--font-size-label);
    font-weight: 500;
    cursor: pointer;
    transition:
      background var(--duration-quick) var(--ease-out),
      transform var(--duration-quick) var(--ease-out);

    &:active {
      transform: translateY(1px);
    }
  }

  @media (hover: hover) {
    .copy:hover {
      background: color-mix(in oklch, var(--colour-text-on-deep) 10%, transparent);
    }
  }
</style>
