import { z } from "zod";

/** A textarea with one item per line, as a list. Blank lines are dropped */
export function lineList(label: string, maxLength: number) {
  return z
    .string()
    .transform(text =>
      text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "")
    )
    .pipe(z.array(z.string().max(maxLength, `Keep each ${label} to ${maxLength} chars or fewer.`)));
}
