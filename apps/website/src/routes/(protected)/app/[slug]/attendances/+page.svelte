<script lang="ts">
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import AttendanceHistoryCard from "$lib/components/cards/AttendanceHistoryCard.svelte";
  import RangeCalendarPopover from "$lib/components/inputs/RangeCalendarPopover.svelte";
  import { orpc } from "$lib/orpc_client";
  import { attendancesHistoryFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();

  const searchParams = useSearchParams(attendancesHistoryFilterSchema);
  const debounceDateFrom = new Debounced(() => searchParams.dateFrom, 1000);
  const debounceDateTo = new Debounced(() => searchParams.dateTo, 1000);

  const attendances = createInfiniteQuery(() =>
    orpc.attendances.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        slug: params.slug,
        cursor,
        pageSize: 20,
        filter: {
          self: true,
          dateFrom: debounceDateFrom.current || undefined,
          dateTo: debounceDateTo.current || undefined,
        },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allAttendances = $derived(attendances.data?.pages.flatMap((page) => page.items) ?? []);
</script>

<div class="space-y-6 p-4 md:p-6 lg:w-1/2 lg:p-8">
  <div>
    <h1 class="text-2xl font-bold">Attendance History</h1>
    <p class="text-muted-foreground">View your attendance records</p>
  </div>

  <div class="flex flex-wrap items-center gap-2">
    <RangeCalendarPopover
      from={searchParams.dateFrom}
      to={searchParams.dateTo}
      onValueChange={({ start, end }) => {
        searchParams.update({
          dateFrom: start
            ? `${start.year}-${start.month.toString().padStart(2, "0")}-${start.day.toString().padStart(2, "0")}`
            : undefined,
          dateTo: end
            ? `${end.year}-${end.month.toString().padStart(2, "0")}-${end.day.toString().padStart(2, "0")}`
            : undefined,
        });
      }}
    />
  </div>

  <div class="space-y-2">
    {#if attendances.isLoading}
      {#each Array(5) as _}
        <div class="border-border bg-card animate-pulse rounded-lg border px-4 py-2.5">
          <div class="flex items-center justify-between gap-4">
            <div class="flex-1">
              <div class="bg-muted mb-1 h-4 w-24 rounded"></div>
              <div class="bg-muted h-3 w-32 rounded"></div>
            </div>
            <div class="flex items-center gap-3">
              <div class="bg-muted h-5 w-16 rounded-full"></div>
            </div>
          </div>
        </div>
      {/each}
    {:else if allAttendances.length === 0}
      <div class="py-8 text-center">
        <p class="text-muted-foreground">No attendance records found</p>
      </div>
    {:else}
      {#each allAttendances as attendance (attendance.id)}
        <AttendanceHistoryCard
          date={attendance.date}
          checkInAt={attendance.checkInAt}
          checkOutAt={attendance.checkOutAt}
          status={attendance.status}
          timezone={attendance.policy.timezone}
        />
      {/each}
    {/if}

    {#if attendances.hasNextPage}
      <div class="flex items-center justify-center py-4">
        <LoadMoreBtn
          onclick={() => attendances.fetchNextPage()}
          loading={attendances.isFetchingNextPage}
          disabled={attendances.isFetchingNextPage}
        />
      </div>
    {/if}
  </div>
</div>
