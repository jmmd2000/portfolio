<script lang="ts">
  import "layerchart/core.css";
  import { AnnotationLine, AnnotationPoint, AnnotationRange, Axis, Chart, Layer, Spline } from "layerchart/svg";
  import { onDestroy } from "svelte";
  import type { ChartAxis, ChartSpec } from "$lib/charts/chartSpec";
  import Button from "$lib/components/form/Button.svelte";

  interface Props {
    spec: ChartSpec;
  }

  let { spec }: Props = $props();

  const replayMilliseconds = 10_000;
  const chartPadding = { top: 12, right: 12, bottom: 44, left: 56 };
  const hoverBoxClearance = 130;
  const numberFormat = new Intl.NumberFormat("en-IE", { maximumFractionDigits: 6 });

  /** How far through the replay it is, from 0 to 1, or null when the whole chart is showing */
  let progress = $state<number | null>(null);
  let animationFrame: number | undefined;
  /** The x value under the pointer, or null when it's off the chart */
  let hoverX = $state<number | null>(null);
  let chartWidth = $state(0);
  let chartHeight = $state(0);

  const canReplay = $derived(spec.replay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const hasKey = $derived(spec.series.length > 1);

  /** The series' points up to the replay's position, ending exactly on it */
  function shownPoints(points: [number, number][], cutOff: number | null): [number, number][] {
    if (cutOff === null) return points;

    const shown = points.filter(([x]) => x <= cutOff);
    const next = points[shown.length];
    const last = shown.at(-1);
    if (!next || !last || next[0] === last[0]) return shown;

    const share = (cutOff - last[0]) / (next[0] - last[0]);
    return [...shown, [cutOff, last[1] + (next[1] - last[1]) * share]];
  }

  const cutOff = $derived(progress === null ? null : spec.x.min + (spec.x.max - spec.x.min) * progress);
  const series = $derived(spec.series.map(line => ({ name: line.name, points: shownPoints(line.points, cutOff) })));
  const flatPoints = $derived(series.flatMap(line => line.points.map(([x, y]) => ({ x, y }))));
  const hoverValues = $derived(hoverX === null ? [] : series.map((line, index) => ({ index, name: line.name, value: valueAt(line.points, hoverX ?? 0) })));
  /** Whether a reading is high enough on the chart that the hover box would cover it */
  const hoverIsNearTop = $derived(hoverValues.some(hover => hover.value !== null && topOf(hover.value) < hoverBoxClearance));

  /** Where the series' line is at an x value, or null when the line doesn't reach it */
  function valueAt(points: [number, number][], x: number): number | null {
    for (let index = 1; index < points.length; index++) {
      const [startX, startY] = points[index - 1];
      const [endX, endY] = points[index];
      if (x < startX || x > endX) continue;
      if (endX === startX) return endY;
      return startY + ((endY - startY) * (x - startX)) / (endX - startX);
    }
    return null;
  }

  function plotWidth(): number {
    return chartWidth - chartPadding.left - chartPadding.right;
  }

  /** The distance from the chart's left edge to an x value */
  function leftOf(x: number): number {
    return chartPadding.left + ((x - spec.x.min) / (spec.x.max - spec.x.min)) * plotWidth();
  }

  /** The distance from the chart's top edge to a y value */
  function topOf(y: number): number {
    const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
    return chartPadding.top + (1 - (y - spec.y.min) / (spec.y.max - spec.y.min)) * plotHeight;
  }

  function trackPointer(event: PointerEvent & { currentTarget: HTMLElement }): void {
    const pointerX = event.clientX - event.currentTarget.getBoundingClientRect().left;
    const share = (pointerX - chartPadding.left) / plotWidth();
    hoverX = share < 0 || share > 1 ? null : spec.x.min + share * (spec.x.max - spec.x.min);
  }

  /** A number for the hover box, with enough decimal places for the axis, so small values don't round to 0 */
  function roundForHover(value: number, axis: ChartAxis): number {
    const decimalPlaces = Math.max(0, 2 - Math.floor(Math.log10(axis.max - axis.min)));
    return Number(value.toFixed(decimalPlaces));
  }

  function startReplay(): void {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    const startedAt = performance.now();

    function nextFrame(now: number): void {
      const share = (now - startedAt) / replayMilliseconds;
      progress = share < 1 ? share : null;
      if (progress !== null) animationFrame = requestAnimationFrame(nextFrame);
    }

    progress = 0;
    animationFrame = requestAnimationFrame(nextFrame);
  }

  onDestroy(() => {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
  });

  function withUnit(value: unknown, unit: string | undefined): string {
    const text = typeof value === "number" ? numberFormat.format(value) : String(value);
    return `${text}${unit ?? ""}`;
  }
</script>

<div
  class="chart"
  role="img"
  aria-label={spec.alt}
  bind:clientWidth={chartWidth}
  bind:clientHeight={chartHeight}
  onpointerdown={trackPointer}
  onpointermove={trackPointer}
  onpointerleave={() => (hoverX = null)}
>
  <Chart data={flatPoints} x="x" y="y" xDomain={[spec.x.min, spec.x.max]} yDomain={[spec.y.min, spec.y.max]} padding={chartPadding}>
    <Layer>
      <Axis placement="left" ticks={spec.y.ticks} format={value => withUnit(value, spec.y.unit)} grid label={spec.y.label} />
      <Axis placement="bottom" ticks={spec.x.ticks} format={value => withUnit(value, spec.x.unit)} label={spec.x.label} />

      {#each spec.ranges as range, index (index)}
        <AnnotationRange x={[range.from, range.to]} label={range.label} labelPlacement="bottom" labelYOffset={6} class="figure-range" props={{ label: { class: "figure-label" } }} />
      {/each}
      {#each spec.lines as limit, index (index)}
        <AnnotationLine
          x={limit.x}
          y={limit.y}
          label={limit.label}
          labelPlacement={index % 2 === 0 ? "top-left" : "top-right"}
          labelYOffset={6}
          props={{ line: { class: "figure-limit" }, label: { class: "figure-label" } }}
        />
      {/each}
      {#each series as line, index (index)}
        <Spline data={line.points.map(([x, y]) => ({ x, y }))} x="x" y="y" class={`figure-series figure-series-${index}`} />
      {/each}
      {#each spec.points as marker, index (index)}
        <AnnotationPoint x={marker.x} y={marker.y} label={marker.label} labelPlacement={marker.side} labelGap={10} props={{ label: { class: "figure-label" } }}>
          {#snippet circle({ props })}
            <rect class="figure-marker-square" x={Number(props.cx) - 6} y={Number(props.cy) - 6} width="12" height="12" />
          {/snippet}
        </AnnotationPoint>
      {/each}
    </Layer>
  </Chart>

  {#if hoverX !== null}
    {@const hoverLeft = leftOf(hoverX)}
    <div class="crosshair" style:left="{hoverLeft}px"></div>
    {#each hoverValues as hover (hover.index)}
      {#if hover.value !== null}
        <div class={`hover-marker series-${hover.index}`} style:left="{hoverLeft}px" style:top="{topOf(hover.value)}px"></div>
      {/if}
    {/each}
    <div class="hover-box" class:flipped={hoverLeft > chartWidth / 2} class:low={hoverIsNearTop} style:left="{hoverLeft}px">
      <strong>{spec.x.label ?? "x"}: {withUnit(roundForHover(hoverX, spec.x), spec.x.unit)}</strong>
      {#each hoverValues as hover (hover.index)}
        {#if hover.value !== null}
          <span>{hover.name}: {withUnit(roundForHover(hover.value, spec.y), spec.y.unit)}</span>
        {/if}
      {/each}
    </div>
  {/if}
</div>

{#if hasKey || canReplay}
  <div class="footer">
    {#if hasKey}
      <div class="key">
        {#each spec.series as line, index (index)}
          <span class={`series-${index}`}>{line.name}</span>
        {/each}
      </div>
    {/if}
    {#if canReplay}
      <Button small onclick={startReplay}>Replay</Button>
    {/if}
  </div>
{/if}

<style>
  .chart {
    position: relative;
    aspect-ratio: var(--figure-ratio);
    /* A sideways drag reads the chart, and an up or down drag still scrolls the page */
    touch-action: pan-y;

    :global {
      .lc-text,
      .lc-axis-tick-label,
      .lc-axis-label {
        fill: var(--muted);
        font-family: var(--font-body);
        font-size: var(--figure-label);
        stroke: var(--paper);
        stroke-width: 4px;
        paint-order: stroke;
      }

      .figure-label,
      .lc-text.figure-label {
        fill: var(--ink);
        font-weight: 600;
      }

      .lc-axis-grid {
        stroke: var(--sunken);
      }

      .lc-axis-rule,
      .lc-axis-tick {
        stroke: var(--line);
      }

      .figure-series {
        fill: none;
        stroke-width: var(--figure-line);
        stroke-linejoin: round;
      }

      .figure-series-0 {
        stroke: var(--ink);
      }

      .figure-series-1 {
        stroke: var(--red);
      }

      .figure-series-2 {
        stroke: var(--muted);
        stroke-dasharray: var(--figure-limit-dash);
      }

      .figure-limit {
        stroke: var(--ink);
        stroke-width: var(--figure-limit-line);
        stroke-dasharray: var(--figure-limit-dash);
      }

      .figure-range {
        fill: var(--sunken);
      }

      .figure-marker-square {
        fill: var(--ink);
      }
    }
  }

  .crosshair {
    position: absolute;
    top: 12px;
    bottom: 44px;
    width: 1px;
    background: var(--muted);
    pointer-events: none;
  }

  .hover-marker {
    position: absolute;
    width: var(--figure-marker);
    height: var(--figure-marker);
    border: 2px solid var(--paper);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .hover-box {
    position: absolute;
    top: 12px;
    display: grid;
    margin-left: var(--space-1);
    padding: 0.25rem 0.5rem;
    border: var(--rule-row);
    background: var(--paper);
    color: var(--ink);
    font-size: var(--type-small);
    font-weight: 600;
    width: max-content;
    max-width: 60%;
    overflow-wrap: anywhere;
    pointer-events: none;

    &.low {
      top: auto;
      bottom: 52px;
    }

    &.flipped {
      margin-left: calc(var(--space-1) * -1);
      transform: translateX(-100%);
    }
  }

  .footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-1) var(--space-2);
    margin-top: var(--space-1);
  }

  .key {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem var(--space-2);
    font-size: var(--type-small);
    font-weight: 600;

    span::before {
      content: "";
      display: inline-block;
      width: 1rem;
      height: var(--figure-line);
      margin-right: 0.4rem;
      background: var(--series-colour);
      vertical-align: middle;
    }
  }

  .series-0 {
    --series-colour: var(--ink);
  }

  .series-1 {
    --series-colour: var(--red);
  }

  .series-2 {
    --series-colour: var(--muted);
  }

  .hover-marker {
    background: var(--series-colour);
  }
</style>
