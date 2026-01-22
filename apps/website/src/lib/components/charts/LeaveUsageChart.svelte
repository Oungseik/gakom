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

<Chart.Container config={{}} class="mx-auto aspect-square max-h-[88px]">
  <ArcChart
    label={props.label}
    value="value"
    outerRadius={0}
    innerRadius={-10}
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
      <circle cx="0" cy="0" r="44" class="fill-background" />
    {/snippet}
    {#snippet aboveMarks()}
      <Text
        value="{props.value}/{props.maxValue}"
        textAnchor="middle"
        verticalAnchor="middle"
        class="fill-foreground text-lg! font-bold"
        dy={-4}
      />
      <Text
        value={props.label}
        textAnchor="middle"
        verticalAnchor="middle"
        class="fill-foreground text-sm"
        dy={10}
      />
    {/snippet}
  </ArcChart>
</Chart.Container>
