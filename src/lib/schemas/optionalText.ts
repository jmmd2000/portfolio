import { z } from "zod";

export function optionalText(label: string, maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength, `Keep the ${label} to ${maxLength} chars or fewer`)
    .transform(text => (text === "" ? null : text));
}
