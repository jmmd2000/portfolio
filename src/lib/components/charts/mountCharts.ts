import { mount, unmount } from "svelte";
import { chartSpecSchema, type ChartSpec } from "$lib/charts/chartSpec";

/** Starts loading a chart a little before it reaches the screen */
const loadMargin = "200px";

function showFailure(placeholder: HTMLElement): void {
  placeholder.append(" This chart couldn't be shown.");
}

function readSpec(placeholder: HTMLElement): ChartSpec | null {
  try {
    const result = chartSpecSchema.safeParse(JSON.parse(placeholder.dataset.chart ?? ""));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/**
 * Draws each chart placeholder in an element as it nears the screen, and returns a function that removes them. The
 * chart library only loads once a page has a chart to draw. If a chart can't be drawn, the reader is told so.
 */
export function mountCharts(element: HTMLElement): () => void {
  const mounted: ReturnType<typeof mount>[] = [];
  let stopped = false;

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
        observer.unobserve(entry.target);
        void drawChart(entry.target);
      }
    },
    { rootMargin: loadMargin }
  );

  async function drawChart(placeholder: HTMLElement): Promise<void> {
    const spec = readSpec(placeholder);
    if (!spec) {
      showFailure(placeholder);
      return;
    }

    try {
      const { default: ArticleChart } = await import("./ArticleChart.svelte");
      if (stopped) return;
      // The placeholder holds the alt text until the chart is ready
      placeholder.textContent = "";
      mounted.push(mount(ArticleChart, { target: placeholder, props: { spec } }));
    } catch (error) {
      console.error("A chart couldn't load", error);
      showFailure(placeholder);
    }
  }

  element.querySelectorAll("[data-chart]").forEach(placeholder => observer.observe(placeholder));

  return () => {
    stopped = true;
    observer.disconnect();
    mounted.forEach(chart => void unmount(chart));
  };
}
