// Lets the admin edit a profile field on the page. Visitors never download the editing code.
import type { Attachment } from "svelte/attachments";
import type { ProfileField } from "$lib/schemas/profile";

/**
 * Lets the signed in admin click a profile field to edit it where it's shown:
 * `<h1 {@attach signedIn && editProfile("name")}>`
 */
export function editProfile(field: ProfileField): Attachment<HTMLElement> {
  return element => {
    let makePlain: (() => void) | undefined;
    let removed = false;

    void import("./profileFieldEditor").then(({ makeProfileFieldEditable }) => {
      // The element can be gone by the time the code arrives
      if (removed) return;
      makePlain = makeProfileFieldEditable(element, field);
    });

    return () => {
      removed = true;
      makePlain?.();
    };
  };
}
