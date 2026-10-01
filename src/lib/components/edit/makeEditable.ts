// Turns the text of an element into an input that saves when you press Enter or click away.
import "./editable.css";
import { showEditStatus } from "./editStatus.svelte";
import { editFailureMessages, type EditResult } from "./sendEdit";

export type CheckResult = { value: string } | { error: string };

export interface EditableOptions {
  /** What the text is, for screen readers and status messages */
  label: string;
  /** Returns the cleaned-up value to save, or what's wrong with it */
  check: (text: string) => CheckResult;
  save: (value: string) => Promise<EditResult>;
}

/**
 * Turns an element's text into its own input.
 * Saves on blur or with Enter, Esc resets to previous text.
 * Returns a function that turns it back into plain text.
 */
export function makeEditable(element: HTMLElement, { label, check, save }: EditableOptions): () => void {
  let savedText = element.textContent ?? "";

  element.contentEditable = "plaintext-only";
  element.dataset.editable = "";
  element.setAttribute("role", "textbox");
  element.setAttribute("aria-label", label);

  function currentText(): string {
    return element.textContent ?? "";
  }

  function restoreSavedText(): void {
    element.textContent = savedText;
    element.removeAttribute("aria-invalid");
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      // Enter saves instead of adding a new line
      event.preventDefault();
      element.blur();
    }
    if (event.key === "Escape") {
      restoreSavedText();
      element.blur();
    }
  }

  /** Marks the text as invalid while typing if there's an error */
  function handleInput(): void {
    const result = check(currentText());
    if ("error" in result) {
      element.setAttribute("aria-invalid", "true");
    } else {
      element.removeAttribute("aria-invalid");
    }
  }

  async function handleBlur(): Promise<void> {
    if (currentText() === savedText) return;

    const result = check(currentText());
    if ("error" in result) {
      restoreSavedText();
      showEditStatus({ status: "error", message: `${label} wasn't saved: ${result.error}` });
      return;
    }

    element.textContent = result.value;
    element.dataset.saving = "";
    const outcome = await save(result.value);
    delete element.dataset.saving;

    // keeps the typed text on a failed save, so nothing is lost. Clicking in and out again retries
    if (outcome !== "saved") {
      showEditStatus({ status: "error", message: `${label} wasn't saved. ${editFailureMessages[outcome]}` });
      return;
    }

    const previousText = savedText;
    savedText = result.value;
    showEditStatus({ status: "success", message: `${label} saved.`, undo: () => void undo(previousText) });
  }

  /** Restores the text from before the last edit */
  async function undo(previousText: string): Promise<void> {
    element.textContent = previousText;
    element.dataset.saving = "";
    const outcome = await save(previousText);
    delete element.dataset.saving;

    if (outcome !== "saved") {
      element.textContent = savedText;
      showEditStatus({ status: "error", message: `${label} wasn't restored. ${editFailureMessages[outcome]}` });
      return;
    }

    savedText = previousText;
    showEditStatus({ status: "success", message: `${label} restored.` });
  }

  function handleFocusOut(): void {
    void handleBlur();
  }

  /** Warns before closing the tab or reloading with an edit that hasn't saved */
  function handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (currentText() !== savedText) event.preventDefault();
  }

  element.addEventListener("keydown", handleKeydown);
  element.addEventListener("input", handleInput);
  element.addEventListener("focusout", handleFocusOut);
  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    element.removeEventListener("keydown", handleKeydown);
    element.removeEventListener("input", handleInput);
    element.removeEventListener("focusout", handleFocusOut);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    element.removeAttribute("contenteditable");
    element.removeAttribute("role");
    element.removeAttribute("aria-label");
    element.removeAttribute("aria-invalid");
    delete element.dataset.editable;
  };
}
