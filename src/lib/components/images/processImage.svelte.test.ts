import { describe, expect, it } from "vitest";
import { defaultUploadSettings } from "$lib/images/uploadSettings";
import { processImage } from "./processImage";

async function pngFile(name: string, width: number, height: number, draw: (context: OffscreenCanvasRenderingContext2D) => void): Promise<File> {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No canvas");
  draw(context);
  return new File([await canvas.convertToBlob({ type: "image/png" })], name, { type: "image/png" });
}

async function widthOf(file: Blob): Promise<number> {
  const bitmap = await createImageBitmap(file);
  return bitmap.width;
}

describe("processImage", () => {
  it("shrinks a wide PNG to the maximum width as WebP, and names it to match", async () => {
    const wide = await pngFile("Wide Shot.png", 3200, 400, context => {
      for (let x = 0; x < 3200; x += 40) {
        context.fillStyle = `hsl(${x % 360} 70% 50%)`;
        context.fillRect(x, 0, 40, 400);
      }
    });

    const processed = await processImage(wide, defaultUploadSettings);

    expect(processed.file.type).toBe("image/webp");
    expect(processed.name).toBe("Wide Shot.webp");
    expect(await widthOf(processed.file)).toBe(1600);
  });

  it("keeps the original when processing would only make it bigger", async () => {
    const canvas = new OffscreenCanvas(200, 200);
    canvas.getContext("2d")?.fillRect(0, 0, 100, 100);
    // Squeezed hard, so encoding it again at full quality can only make it bigger
    const squeezed = new File([await canvas.convertToBlob({ type: "image/jpeg", quality: 0.1 })], "squeezed.jpg", { type: "image/jpeg" });

    const processed = await processImage(squeezed, { ...defaultUploadSettings, quality: 100, convertToWebP: false });

    expect(processed.file).toBe(squeezed);
    expect(processed.name).toBe("squeezed.jpg");
  });

  it("leaves an SVG exactly as it is", async () => {
    const svg = new File(['<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>'], "logo.svg", { type: "image/svg+xml" });

    expect((await processImage(svg, defaultUploadSettings)).file).toBe(svg);
  });
});
