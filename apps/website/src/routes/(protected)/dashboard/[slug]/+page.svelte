<script lang="ts">
  import ListChecksIcon from "@lucide/svelte/icons/list-checks";
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import { Button } from "@repo/ui/button";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import { useSearchParams } from "runed/kit";

  import { page } from "$app/state";
  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import RangeCalendarPopover from "$lib/components/inputs/RangeCalendarPopover.svelte";
  import Search from "$lib/components/inputs/Search.svelte";
  import SelectDropdown from "$lib/components/inputs/SelectDropdown.svelte";
  import SkeletonStatsCard from "$lib/components/skeletons/SkeletonStatsCard.svelte";
  import AttendanceStatistics from "$lib/components/statistics/AttendanceStatistics.svelte";
  import { columns } from "$lib/components/tables/AttendanceTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { attendancesFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types.js";

  const { params }: PageProps = $props();
  const status = [
    { label: "Present", value: "PRESENT" as const },
    { label: "Late", value: "LATE" as const },
    { label: "Early leave", value: "EARLY_LEAVE" as const },
    { label: "Absent", value: "ABSENT" as const },
    { label: "Incomplete", value: "INCOMPLETE" as const },
  ];

  const searchParams = useSearchParams(attendancesFilterSchema);
  const debounceSearch = new Debounced(() => searchParams.search, 1000);
  const debounceStatus = new Debounced(() => searchParams.status, 1000);
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
          search: debounceSearch.current || undefined,
          dateFrom: debounceDateFrom.current || undefined,
          dateTo: debounceDateTo.current || undefined,
          status: debounceStatus.current.length ? debounceStatus.current : undefined,
        },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allAttendances = $derived(attendances.data?.pages.flatMap((page) => page.items) ?? []);

  const stats = createQuery(() =>
    orpc.attendances.stats.queryOptions({
      input: {
        slug: params.slug,
        filter: {
          dateFrom: debounceDateFrom.current || undefined,
          dateTo: debounceDateTo.current || undefined,
        },
      },
      enabled: !!params.slug,
    })
  );
</script>

<DashboardHeader breadcrumbItems={[{ desc: "Dashboard", href: `/dashboard/${params.slug}` }]} />

<DashboardContainer>
  <section class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
    {#if stats.isLoading}
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
    {:else if stats.data}
      <AttendanceStatistics data={stats.data} />
    {/if}
  </section>

  <section>
    <div class="my-4 space-y-2">
      <div class="flex flex-wrap gap-2">
        <Search bind:value={searchParams.search} />

        <div>
          <SelectDropdown
            multiple
            icon={ListChecksIcon}
            data={status}
            desc="Status"
            value={searchParams.status}
            onCheckedChange={(value) => {
              if (searchParams.status.includes(value)) {
                searchParams.status = searchParams.status?.filter((s) => s !== value);
              } else {
                searchParams.status = [...(searchParams.status || []), value];
              }
            }}
          />
        </div>

        <div>
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
        {#if page.url.search}
          <div>
            <Button variant="outline" onclick={() => searchParams.reset()}
              ><RotateCcwIcon class="size-4" />Reset filter</Button
            >
          </div>
        {/if}
      </div>
    </div>

    <DataTable {columns} data={allAttendances} loading={attendances.isLoading} />

    {#if attendances.hasNextPage}
      <div class="flex items-center justify-center py-4">
        <LoadMoreBtn
          onclick={() => attendances.fetchNextPage()}
          loading={attendances.isFetchingNextPage}
          disabled={attendances.isFetchingNextPage}
        />
      </div>
    {/if}
  </section>
</DashboardContainer>
