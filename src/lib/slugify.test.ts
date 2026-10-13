import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("joins lowercase words with hyphens", () => {
    expect(slugify("How the Sand Falls")).toBe("how-the-sand-falls");
  });

  it("drops accents instead of the letters under them", () => {
    expect(slugify("Café crème")).toBe("cafe-creme");
  });

  it("turns any run of punctuation and spaces into one hyphen, with none at either end", () => {
    expect(slugify("  Svelte 5: runes, & more!  ")).toBe("svelte-5-runes-more");
  });

  it("returns nothing when the text has no letters or numbers", () => {
    expect(slugify("¿?!")).toBe("");
  });
});
