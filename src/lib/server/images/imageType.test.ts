import { describe, expect, it } from "vitest";
import { detectImageType } from "./imageType";

const text = (value: string) => new TextEncoder().encode(value);

describe("detectImageType", () => {
  it("knows each accepted type from its first bytes", () => {
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))?.contentType).toBe("image/jpeg");
    expect(detectImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.contentType).toBe("image/png");
    expect(detectImageType(text("GIF89a..."))?.contentType).toBe("image/gif");
    expect(detectImageType(text("RIFF\0\0\0\0WEBPVP8 "))?.contentType).toBe("image/webp");
    expect(detectImageType(text("\0\0\0\x1cftypavif"))?.contentType).toBe("image/avif");
  });

  it("finds an SVG behind an XML declaration, a doctype and comments", () => {
    const svg = text('﻿<?xml version="1.0"?>\n<!-- logo -->\n<!DOCTYPE svg>\n  <svg xmlns="http://www.w3.org/2000/svg"></svg>');

    expect(detectImageType(svg)).toEqual({ extension: "svg", contentType: "image/svg+xml" });
  });

  it("refuses files that only claim to be images", () => {
    expect(detectImageType(text("<html><svg></svg></html>"))).toBeNull();
    expect(detectImageType(text("%PDF-1.7"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });
});
