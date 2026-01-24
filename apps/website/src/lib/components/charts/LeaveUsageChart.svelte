<script lang="ts">
  import * as Chart from "@repo/ui/chart";
  import { ArcChart, Text } from "layerchart";

  type Props = {
    maxValue: number;
    label: string;
    value: number;
    key: string;
    color: string;
  };

  const props: Props = $props();

  const chartData = $derived([{ key: props.key, value: props.value, color: props.color }]);
</script>

<div class="h-36 w-36 shrink-0">
  <Chart.Container config={{}} class="mx-auto aspect-square max-h-[80px]">
    <ArcChart
      label={props.label}
      value="value"
      outerRadius={0}
      innerRadius={-8}
      padding={0}
      range={[0, 360]}
      maxValue={props.maxValue}
      cornerRadius={20}
      series={chartData.map((d) => ({
        key: d.key,
        color: d.color,
        data: [d],
      }))}
      props={{
        arc: { track: { fill: "var(--muted)" }, motion: "tween" },
        tooltip: { context: { hideDelay: 350 } },
      }}
      tooltip={false}
    >
      {#snippet belowMarks()}
        <circle cx="0" cy="0" r="40" class="fill-background" />
      {/snippet}
      {#snippet aboveMarks()}
        <Text
          value={props.value.toFixed(1)}
          textAnchor="middle"
          verticalAnchor="middle"
          class="fill-foreground text-lg! font-bold"
          dy={0}
        />
      {/snippet}
    </ArcChart>
  </Chart.Container>
  <div class="mt-2 text-center">
    <h2 class="w-36 truncate">{props.label}</h2>
    <p class="text-muted-foreground text-sm">Allowed {props.maxValue}</p>
  </div>
</div>
