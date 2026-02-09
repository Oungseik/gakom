<script lang="ts">
  import { CalendarDate, type DateValue } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import { buttonVariants } from "@repo/ui/button";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";

  type Props = {
    from?: string;
    to?: string;
    onValueChange: (param: { start?: DateValue; end?: DateValue }) => void;
  };

  const { from, to, onValueChange }: Props = $props();
  const start = $derived(from?.split("-"));
  const end = $derived(to?.split("-"));
</script>

<Popover.Root>
  <Popover.Trigger class={buttonVariants({ variant: "outline" })}>
    <CalendarIcon class="size-4" />
    Date Range
  </Popover.Trigger>
  <Popover.Content class="w-124 p-0">
    <RangeCalendar
      value={{
        start:
          start &&
          new CalendarDate(
            Number(start.at(0) ?? 0),
            Number(start.at(1) ?? 0),
            Number(start.at(2) ?? 0)
          ),
        end:
          end &&
          new CalendarDate(Number(end.at(0) ?? 0), Number(end.at(1) ?? 0), Number(end.at(2) ?? 0)),
      }}
      numberOfMonths={2}
      class="rounded-lg border shadow-sm"
      {onValueChange}
    />
  </Popover.Content>
</Popover.Root>
