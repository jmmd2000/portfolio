// Holds the message that the status bar shows after each edit.
interface EditStatus {
  status: "success" | "error";
  message: string;
  /** Restores previous content */
  undo?: () => void;
}

/** The latest edit's outcome. */
export const editStatus: { current: EditStatus | null } = $state({ current: null });

let clearTimer: ReturnType<typeof setTimeout> | undefined;

/** Shows how an edit went. Success clears after 8 seconds, an error stays until the next edit */
export function showEditStatus(outcome: EditStatus): void {
  clearTimeout(clearTimer);
  editStatus.current = outcome;

  if (outcome.status === "success") {
    clearTimer = setTimeout(() => {
      editStatus.current = null;
    }, 8000);
  }
}

export function clearEditStatus(): void {
  clearTimeout(clearTimer);
  editStatus.current = null;
}
