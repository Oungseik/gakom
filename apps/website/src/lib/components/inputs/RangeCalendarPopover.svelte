<script lang="ts">
  import { type DateValue } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import { Button } from "@repo/ui/button";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";

  type Props = {
    from?: string;
    to?: string;
    onValueChange: (param: { start?: DateValue; end?: DateValue }) => void;
  };

  const { from, to, onValueChange }: Props = $props();
</script>

<Popover.Root>
  <Popover.Trigger>
    <Button variant="outline" class="w-54">
      <CalendarIcon class="size-4" />
      {#if from}
        {from} - {to ?? "today"}
      {:else}
        Date Range
      {/if}
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-124 p-0">
    <RangeCalendar numberOfMonths={2} class="rounded-lg border shadow-sm" {onValueChange} />
  </Popover.Content>
</Popover.Root>
