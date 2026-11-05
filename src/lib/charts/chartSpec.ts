import { z } from "zod";

const axisSchema = z
  .strictObject({
    label: z.string().optional(),
    /** Shown after each tick's number, such as GB */
    unit: z.string().optional(),
    min: z.number(),
    max: z.number(),
    ticks: z.array(z.number()).optional(),
  })
  .superRefine((axis, context) => {
    if (axis.min >= axis.max) context.addIssue({ code: "custom", path: ["max"], message: "max has to be above min" });
    if (axis.ticks?.some(tick => tick < axis.min || tick > axis.max)) context.addIssue({ code: "custom", path: ["ticks"], message: "every tick has to be between min and max" });
  });

const seriesSchema = z.strictObject({
  name: z.string().min(1),
  points: z.array(z.tuple([z.number(), z.number()])).min(2),
});

/** A dashed limit across the chart, at one x or one y */
const limitSchema = z.strictObject({
  x: z.number().optional(),
  y: z.number().optional(),
  label: z.string().optional(),
});

/** A square marker at one place on the chart */
const markerSchema = z.strictObject({
  x: z.number(),
  y: z.number(),
  label: z.string().optional(),
  /** Which side of the marker the label sits on */
  side: z.enum(["top", "bottom", "left", "right"]).default("top"),
});

/** A span of the x axis, such as how long something ran */
const rangeSchema = z.strictObject({
  from: z.number(),
  to: z.number(),
  label: z.string().optional(),
});

function isInside(value: number, axis: z.infer<typeof axisSchema>): boolean {
  return value >= axis.min && value <= axis.max;
}

/**
 * Refuses anything the chart couldn't draw truthfully, so a chart never silently cuts off data. A line has to run left
 * to right because the hover reading follows it that way. Equal x values are fine, and make a vertical drop.
 */
export const chartSpecSchema = z
  .strictObject({
    type: z.literal("line"),
    /** What the chart shows, for people who can't see it */
    alt: z.string().min(1),
    caption: z.string().optional(),
    x: axisSchema,
    y: axisSchema,
    series: z.array(seriesSchema).min(1).max(3),
    lines: z.array(limitSchema).default([]),
    points: z.array(markerSchema).default([]),
    ranges: z.array(rangeSchema).default([]),
    /** Adds a button that draws the chart from left to right */
    replay: z.boolean().default(false),
  })
  .superRefine((chart, context) => {
    chart.series.forEach((line, seriesIndex) => {
      const path = ["series", seriesIndex, "points"];
      line.points.forEach(([x, y], pointIndex) => {
        if (!isInside(x, chart.x) || !isInside(y, chart.y)) context.addIssue({ code: "custom", path: [...path, pointIndex], message: `[${x}, ${y}] is outside the axes` });
        const previous = line.points[pointIndex - 1];
        if (previous && x < previous[0]) context.addIssue({ code: "custom", path: [...path, pointIndex], message: "points have to be in order of x" });
      });
    });

    chart.lines.forEach((limit, index) => {
      const path = ["lines", index];
      if ((limit.x === undefined) === (limit.y === undefined)) context.addIssue({ code: "custom", path, message: "a limit needs either x or y" });
      if ((limit.x !== undefined && !isInside(limit.x, chart.x)) || (limit.y !== undefined && !isInside(limit.y, chart.y)))
        context.addIssue({ code: "custom", path, message: "this limit is outside the axes" });
    });

    chart.points.forEach((marker, index) => {
      if (!isInside(marker.x, chart.x) || !isInside(marker.y, chart.y)) context.addIssue({ code: "custom", path: ["points", index], message: "this marker is outside the axes" });
    });

    chart.ranges.forEach((range, index) => {
      const path = ["ranges", index];
      if (range.from >= range.to) context.addIssue({ code: "custom", path, message: "to has to be above from" });
      if (!isInside(range.from, chart.x) || !isInside(range.to, chart.x)) context.addIssue({ code: "custom", path, message: "this range is outside the x axis" });
    });
  });

export type ChartSpec = z.infer<typeof chartSpecSchema>;
export type ChartAxis = ChartSpec["x"];
