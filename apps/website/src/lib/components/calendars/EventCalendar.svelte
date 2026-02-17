<script lang="ts">
  import { CalendarDate, type DateValue, isSameDay, isSameMonth } from "@internationalized/date";
  import { ChevronLeft, ChevronRight } from "@lucide/svelte";
  import { Button } from "@repo/ui/button";

  type AttendanceData = {
    date: string;
    checkInAt: Date | null;
    checkOutAt: Date | null;
  };

  type Props = {
    attendances?: AttendanceData[];
    events?: Date[];
    value?: DateValue;
    onValueChange?: (value: DateValue | undefined) => void;
  };

  let { attendances = [], events = [], value = $bindable(), onValueChange }: Props = $props();

  const today = new Date();
  const todayCalendarDate = new CalendarDate(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  let placeholder = $state(
    value
      ? new CalendarDate(value.year, value.month, value.day)
      : new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1)
  );

  $effect(() => {
    if (value) {
      placeholder = new CalendarDate(value.year, value.month, value.day);
    }
  });

  function getDateString(date: DateValue): string {
    const year = date.year;
    const month = String(date.month).padStart(2, "0");
    const day = String(date.day).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function isToday(date: DateValue): boolean {
    return isSameDay(date, todayCalendarDate);
  }

  function isFuture(date: DateValue): boolean {
    const dateObj = new Date(date.year, date.month - 1, date.day);
    const todayObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateObj > todayObj;
  }

  function getAttendanceStatus(date: DateValue) {
    const dateStr = getDateString(date);
    return attendances.find((a) => a.date === dateStr);
  }

  function hasEvent(date: DateValue): boolean {
    const dateObj = new Date(date.year, date.month - 1, date.day);
    return events.some(
      (eventDate) =>
        eventDate.getFullYear() === dateObj.getFullYear() &&
        eventDate.getMonth() === dateObj.getMonth() &&
        eventDate.getDate() === dateObj.getDate()
    );
  }

  function handleSelect(d: DateValue) {
    value = d;
    onValueChange?.(d);
  }

  function goToPrevMonth() {
    placeholder = placeholder.subtract({ months: 1 });
    value = placeholder;
    onValueChange?.(placeholder);
  }

  function goToNextMonth() {
    placeholder = placeholder.add({ months: 1 });
    value = placeholder;
    onValueChange?.(placeholder);
  }

  const weeks = $derived.by(() => {
    const firstDayOfMonth = new Date(placeholder.year, placeholder.month - 1, 1);
    const dayOfWeek = firstDayOfMonth.getDay();
    const startDate = new CalendarDate(
      firstDayOfMonth.getFullYear(),
      firstDayOfMonth.getMonth() + 1,
      firstDayOfMonth.getDate()
    ).subtract({ days: dayOfWeek });

    const weeks: DateValue[][] = [];
    let currentDate = startDate;

    for (let week = 0; week < 6; week++) {
      const lastDayOfWeek = currentDate.add({ days: 6 });

      if (
        lastDayOfWeek.month !== placeholder.month &&
        currentDate.month !== placeholder.month
      ) {
        break;
      }

      const weekDates: DateValue[] = [];
      for (let day = 0; day < 7; day++) {
        weekDates.push(currentDate);
        currentDate = currentDate.add({ days: 1 });
      }
      weeks.push(weekDates);
    }

    return weeks;
  });

  const monthName = $derived.by(() => {
    const date = placeholder.toDate("UTC");
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  });

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
</script>

<div class="flex w-full flex-col gap-2 rounded-md border p-3 sm:gap-3">
  <div class="flex items-center justify-center gap-4">
    <Button variant="ghost" size="icon" class="size-7 sm:size-8" onclick={goToPrevMonth}>
      <ChevronLeft class="size-3.5 sm:size-4" />
    </Button>
    <span class="text-xs font-medium sm:text-sm">{monthName}</span>
    <Button variant="ghost" size="icon" class="size-7 sm:size-8" onclick={goToNextMonth}>
      <ChevronRight class="size-3.5 sm:size-4" />
    </Button>
  </div>

  <div class="grid grid-cols-7 gap-0.5 text-center sm:gap-1">
    {#each weekdays as weekday}
      <span class="text-muted-foreground text-[10px] font-medium sm:text-xs">{weekday}</span>
    {/each}
  </div>

  <div class="grid grid-cols-7 gap-0.5 sm:gap-1">
    {#each weeks as week}
      {#each week as date}
        {@const attendance = getAttendanceStatus(date)}
        {@const hasEventDay = hasEvent(date)}
        {@const isTodayDate = isToday(date)}
        {@const isFutureDate = isFuture(date)}
        {@const isCurrentMonth = isSameMonth(date, placeholder)}
        {@const checkInMissed = !isFutureDate && attendance && !attendance.checkInAt}
        {@const checkOutMissed =
          !isFutureDate && attendance && attendance.checkInAt && !attendance.checkOutAt}
        <button
          type="button"
          class="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative flex aspect-square flex-col items-center justify-center rounded-md border-0 p-0 text-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:text-sm
            {isTodayDate ? 'bg-primary/10 text-primary font-semibold' : ''}
            {!isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}"
          disabled={!isCurrentMonth || isFutureDate}
          onclick={() => handleSelect(date)}
        >
          {#if hasEventDay}
            <span
              class="absolute top-0.5 h-1 w-1 rounded-full bg-blue-500 sm:top-1 sm:h-1.5 sm:w-1.5"
            ></span>
          {/if}
          <span class="z-10">{date.day}</span>
          {#if !isFutureDate && isCurrentMonth}
            <div class="mt-0.5 flex gap-0.5">
              <span
                class="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5
                  {attendance?.checkInAt
                  ? 'bg-green-500'
                  : checkInMissed
                    ? 'bg-red-500'
                    : 'bg-transparent'}"
              ></span>
              <span
                class="h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5
                  {attendance?.checkOutAt
                  ? 'bg-green-500'
                  : checkOutMissed
                    ? 'bg-red-500'
                    : 'bg-transparent'}"
              ></span>
            </div>
          {/if}
        </button>
      {/each}
    {/each}
  </div>
</div>
