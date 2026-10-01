// Sends an edit to the server and tells the caller if it saved.
export type EditResult = "saved" | "signed-out" | "failed";

/** Messages for an edit that didn't save */
export const editFailureMessages: Record<Exclude<EditResult, "saved">, string> = {
  "signed-out": "You've been signed out. Log in again in a new tab, then try again.",
  failed: "Try again.",
};

/**
 * Sends an edit to an admin endpoint.
 * Never throws, a network failure comes back as "failed".
 */
export async function sendEdit(url: string, method: "PATCH" | "POST" | "PUT" | "DELETE", body?: unknown): Promise<EditResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) return "saved";
    if (response.status === 401) return "signed-out";
    return "failed";
  } catch {
    return "failed";
  }
}
