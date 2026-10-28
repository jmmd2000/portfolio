import type { SubmitFunction } from "@sveltejs/kit";

/**
 * Options for `use:enhance` on the admin forms, By default SvelteKit empties a form after a successful save, which would blank every field showing a saved value, this keeps them.
 */
export const keepValues: SubmitFunction = () => {
  return async ({ update }) => {
    await update({ reset: false });
  };
};
