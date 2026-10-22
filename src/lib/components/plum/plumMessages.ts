import type { PlumAction } from "$lib/plum/plumRules";

/** What the visitor reads after each action. Each visitor sees them in turn, so a repeat action reads differently */
const doneMessages: Record<PlumAction, string[]> = {
  feed: ["You fed her just now. Everyone who visits will see it.", "You fed her. She ate the lot.", "You fed her. She ate half and saved the rest for later."],
  pet: ["You petted her. She's purring.", "You petted her. She leaned into it.", "You petted her. She pretended not to care."],
  play: ["You played with her. She's a bit tired now.", "You threw the ball. She brought it back, eventually.", "You played with her. She won."],
};

export const refusalMessages = {
  full: "She's full. She sniffed it and walked off.",
  tired: "She's too tired to play. Let her rest for a while.",
};

export const othersMessages: Record<PlumAction, string> = {
  feed: "Someone else just fed her.",
  pet: "Someone else just petted her.",
  play: "Someone else just played with her.",
};

export const coolingMessage = "Someone else got there first.";

export const unreachableMessage = "Plum couldn't be reached. Try again in a minute.";

/** The message for the visitor's `count`th time doing an action, starting from 0 */
export function doneMessage(action: PlumAction, count: number): string {
  const messages = doneMessages[action];
  return messages[count % messages.length] ?? messages[0] ?? "";
}
