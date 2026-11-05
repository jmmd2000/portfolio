import { describe, expect, it } from "vitest";
import { parseChartBlock } from "./chartBlocks";

const validChart = `
type: line
alt: A rising line
x: { min: 0, max: 10 }
y: { min: 0, max: 5 }
series:
  - name: One
    points: [[0, 0], [10, 5]]
`;

describe("parseChartBlock", () => {
  it("accepts a line chart", () => {
    expect(parseChartBlock(validChart).problem).toBeNull();
  });

  it("reports YAML that can't be read", () => {
    expect(parseChartBlock("type: [line").problem).toContain("isn't valid YAML");
  });

  it("requires alt text", () => {
    expect(parseChartBlock(validChart.replace("alt: A rising line\n", "")).problem).not.toBeNull();
  });

  it("names the field in a problem", () => {
    expect(parseChartBlock(validChart.replace("max: 5", 'max: "5"')).problem).toContain("y.max");
  });

  it("refuses points outside the axes, so data can't be cut off", () => {
    expect(parseChartBlock(validChart.replace("[10, 5]", "[10, 9]")).problem).toContain("outside the axes");
  });

  it("refuses points out of order, which the hover reading can't follow", () => {
    expect(parseChartBlock(validChart.replace("[[0, 0], [10, 5]]", "[[10, 5], [0, 0]]")).problem).toContain("in order");
  });

  it("refuses an axis with no length", () => {
    expect(parseChartBlock(validChart.replace("min: 0, max: 10", "min: 5, max: 5")).problem).toContain("above min");
  });

  it("refuses a series too short to draw", () => {
    expect(parseChartBlock(validChart.replace("[[0, 0], [10, 5]]", "[[0, 0]]")).problem).not.toBeNull();
  });
});
