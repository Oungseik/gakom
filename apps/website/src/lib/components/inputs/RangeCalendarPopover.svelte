<script lang="ts">
  import { CalendarDate, type DateValue } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import { buttonVariants } from "@repo/ui/button";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";

  import { formatDate } from "$lib/utils";

  type Props = {
    from?: string;
    to?: string;
    onValueChange: (param: { start?: DateValue; end?: DateValue }) => void;
  };

  const { from, to, onValueChange }: Props = $props();
  const start = $derived(from?.split("-"));
  const end = $derived(to?.split("-"));

  const value = $derived(
    start
      ? {
          start: new CalendarDate(
            Number(start.at(0) ?? 0),
            Number(start.at(1) ?? 0),
            Number(start.at(2) ?? 0)
          ),
          end:
            end &&
            new CalendarDate(Number(end.at(0) ?? 0), Number(end.at(1) ?? 0), Number(end.at(2) ?? 0)),
        }
      : undefined
  );

  const displayValue = $derived(
    value?.start
      ? `${formatDate(value.start.toDate("UTC"))}${
          value.end ? ` - ${formatDate(value.end.toDate("UTC"))}` : ""
        }`
      : null
  );
</script>

<Popover.Root>
  <Popover.Trigger class={buttonVariants({ variant: "outline" })}>
    <CalendarIcon class="size-4" />
    {#if displayValue}
      {displayValue}
    {:else}
      Date Range
    {/if}
    <ChevronDownIcon class="size-4" />
  </Popover.Trigger>
  <Popover.Content class="w-124 p-0">
    <RangeCalendar
      {value}
      numberOfMonths={2}
      class="rounded-lg border shadow-sm"
      {onValueChange}
    />
  </Popover.Content>
</Popover.Root>
