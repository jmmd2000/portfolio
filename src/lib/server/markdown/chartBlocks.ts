import { parse } from "yaml";
import { chartSpecSchema, type ChartSpec } from "$lib/charts/chartSpec";
import { escapeHTML } from "./highlightCode";

type ChartParseResult = { spec: ChartSpec; problem: null } | { spec: null; problem: string };

function readYAML(text: string): unknown {
  try {
    return parse(text);
  } catch {
    return undefined;
  }
}

/** Reads a chart block's YAML, and says what's wrong with it when it can't be drawn */
export function parseChartBlock(text: string): ChartParseResult {
  const value = readYAML(text);
  if (value === undefined) return { spec: null, problem: "This chart isn't valid YAML." };

  const result = chartSpecSchema.safeParse(value);
  if (result.success) return { spec: result.data, problem: null };

  const [issue] = result.error.issues;
  return { spec: null, problem: `This chart has a problem at "${issue.path.join(".")}": ${issue.message}` };
}

/**
 * Turns a chart block into a figure that the page fills in. The chart itself is drawn in the browser, from the spec
 * in `data-chart`. Until then, and without JavaScript, the alt text shows in its place. A block with a problem says what's wrong when `showProblems` is true. Otherwise it tells readers
 * that a chart is missing, so they don't take the text around it as complete.
 */
export function renderChartBlock(text: string, showProblems: boolean): string {
  const { spec, problem } = parseChartBlock(text);
  if (problem !== null)
    return showProblems
      ? `<p class="album-problem"><strong>${escapeHTML(problem)}</strong>Readers see "This chart couldn't be shown."</p>\n`
      : '<p class="chart-problem">This chart couldn\'t be shown.</p>\n';

  const caption = spec.caption ? `<figcaption>${escapeHTML(spec.caption)}</figcaption>` : "";
  return `<figure class="chart"><div data-chart="${escapeHTML(JSON.stringify(spec))}">${escapeHTML(spec.alt)}</div>${caption}</figure>\n`;
}
