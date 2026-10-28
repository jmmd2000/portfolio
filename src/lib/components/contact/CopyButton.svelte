<script lang="ts">
  interface Props {
    text: string;
    label?: string;
    /** Selected instead when the clipboard is blocked, so the visitor can copy it themselves */
    selectTarget?: HTMLElement;
  }

  let { text, label = "Copy", selectTarget }: Props = $props();

  let result = $state("");
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
      result = "Copied";
      status = "Copied to the clipboard";
    } catch {
      if (selectTarget) selectText(selectTarget);
      result = "Selected";
      status = "The address is selected, ready to copy.";
    }
    resetTimer = setTimeout(() => {
      result = "";
      status = "";
    }, 2000);
  }
</script>

<button type="button" class="copy label" class:done={result !== ""} onclick={copy}>{result || label}</button>
<span class="visually-hidden" aria-live="polite">{status}</span>

<style>
  .copy {
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    text-decoration: underline;
    text-decoration-color: var(--red);
    text-decoration-thickness: 3px;
    text-underline-offset: 5px;
    cursor: pointer;
    transition: text-decoration-thickness var(--duration-quick) var(--ease-out);

    &.done {
      color: var(--red);
    }
  }

  @media (hover: hover) {
    .copy:hover {
      text-decoration-thickness: 6px;
    }
  }

  @media (hover: none) {
    .copy {
      padding-block: var(--space-1);
    }
  }
</style>
