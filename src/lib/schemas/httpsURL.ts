import { z } from "zod";

function isHTTPSAddress(text: string): boolean {
  return z.url({ protocol: /^https$/ }).safeParse(text).success;
}

export function httpsURL(label: string) {
  return z.string().trim().refine(isHTTPSAddress, `Use a full https:// address for the ${label}`);
}

export function optionalHTTPSURL(label: string) {
  return z
    .string()
    .trim()
    .refine(text => text === "" || isHTTPSAddress(text), `Use a full https:// address for the ${label} or leave it empty`)
    .transform(text => (text === "" ? null : text));
}
