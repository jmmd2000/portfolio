import { describe, expect, it } from "vitest";
import { defaultUploadSettings, readUploadSettings } from "./uploadSettings";

const storageHolding = (value: string | null) => ({ getItem: () => value });

describe("readUploadSettings", () => {
  it("reads settings the uploader saved", () => {
    expect(readUploadSettings(storageHolding('{"maxWidth":2400,"quality":70,"convertToWebP":false}'))).toEqual({ maxWidth: 2400, quality: 70, convertToWebP: false });
  });

  it("falls back to the defaults for nothing saved, broken JSON, values out of range and blocked storage", () => {
    expect(readUploadSettings(storageHolding(null))).toEqual(defaultUploadSettings);
    expect(readUploadSettings(storageHolding("{not json"))).toEqual(defaultUploadSettings);
    expect(readUploadSettings(storageHolding('{"maxWidth":2400,"quality":0,"convertToWebP":true}'))).toEqual(defaultUploadSettings);
    expect(
      readUploadSettings({
        getItem: () => {
          throw new Error("Storage is blocked");
        },
      })
    ).toEqual(defaultUploadSettings);
  });
});
