const units = ["KB", "MB", "GB"];

/** A size for people to read, like "512 B", "340 KB" or "2.1 MB". Sizes under 10 of a unit keep one decimal place */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;

  let value = bytes;
  let unit = "B";
  for (const nextUnit of units) {
    if (value < 1000) break;
    value /= 1000;
    unit = nextUnit;
  }
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  return `${rounded} ${unit}`;
}
