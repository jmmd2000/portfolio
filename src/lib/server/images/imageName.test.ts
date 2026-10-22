import { describe, expect, it } from "vitest";
import { uploadName } from "./imageName";

describe("uploadName", () => {
  it("makes the name URL-safe and uses the extension of the file's real type", () => {
    expect(uploadName("My Photo (1).PNG", "webp", "3f9a2c1b")).toBe("my-photo-1-3f9a2c1b.webp");
  });

  it("falls back to image when nothing usable is left of the name", () => {
    expect(uploadName("💾.jpg", "jpg", "3f9a2c1b")).toBe("image-3f9a2c1b.jpg");
    expect(uploadName(".png", "png", "3f9a2c1b")).toBe("image-3f9a2c1b.png");
  });

  it("cuts a long name short without leaving a hyphen before the suffix", () => {
    const name = uploadName(`${"a".repeat(59)} b c.png`, "png", "3f9a2c1b");

    expect(name).toBe(`${"a".repeat(59)}-3f9a2c1b.png`);
  });
});
