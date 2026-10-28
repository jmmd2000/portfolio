import { z } from "zod";

/** A checkbox as true or false. A ticked box sends "on", and an unticked one sends nothing at all */
export const checkbox = z
  .literal("on")
  .optional()
  .transform(value => value === "on");
