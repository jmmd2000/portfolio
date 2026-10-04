import { describe, expect, it } from "vitest";
import { currentlyRowSchema } from "./currentlyRow";

const typedRow = { label: "Reading", title: "Piranesi", subtitle: "", url: "", imageURL: "" };

describe("currentlyRowSchema", () => {
  it("stores empty optional fields as null, and an unticked box as hidden", () => {
    const row = currentlyRowSchema.parse(typedRow);

    expect(row.subtitle).toBeNull();
    expect(row.url).toBeNull();
    expect(row.imageURL).toBeNull();
    expect(row.shown).toBe(false);
  });

  it("reads a ticked box as shown", () => {
    expect(currentlyRowSchema.parse({ ...typedRow, shown: "on" }).shown).toBe(true);
  });

  it("refuses a cover or link that isn't https", () => {
    expect(currentlyRowSchema.safeParse({ ...typedRow, imageURL: "http://example.com/cover.jpg" }).success).toBe(false);
    expect(currentlyRowSchema.safeParse({ ...typedRow, url: "javascript:alert(1)" }).success).toBe(false);
  });
});
