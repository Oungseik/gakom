<script lang="ts">
  import { type CalendarDate } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import FilterIcon from "@lucide/svelte/icons/filter";
  import SearchIcon from "@lucide/svelte/icons/search";
  import { Button } from "@repo/ui/button";
  import { Checkbox } from "@repo/ui/checkbox";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import SkeletonStatsCard from "$lib/components/skeletons/SkeletonStatsCard.svelte";
  import AttendanceStatistics from "$lib/components/statistics/AttendanceStatistics.svelte";
  import { columns } from "$lib/components/tables/AttendanceTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { attendancesFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types.js";

  const { params }: PageProps = $props();

  const searchParams = useSearchParams(attendancesFilterSchema);
  const debounceSearch = new Debounced(() => searchParams.search, 500);
  const debounceStatus = new Debounced(() => searchParams.status, 1000);

  let date: { start: CalendarDate; end: CalendarDate } | undefined = $state();

  const attendances = createInfiniteQuery(() =>
    orpc.organizations.attendances.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        slug: params.slug,
        cursor,
        pageSize: 10,
        filter: {
          search: debounceSearch.current || undefined,
          dateFrom: date?.start?.toString(),
          dateTo: date?.end?.toString(),
          status: debounceStatus.current.length ? debounceStatus.current : undefined,
        },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allAttendances = $derived(attendances.data?.pages.flatMap((page) => page.items) ?? []);

  const stats = createQuery(() =>
    orpc.organizations.attendances.stats.get.queryOptions({
      input: { slug: params.slug },
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
      <h1 class="text-muted-foreground text-lg font-medium">Attendances</h1>

      <div class="flex flex-wrap gap-2">
        <div class="relative">
          <SearchIcon class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search name or email..."
            class="w-[200px] pl-9 sm:w-[300px]"
            bind:value={searchParams.search}
          />
        </div>

        <Popover.Root>
          <Popover.Trigger>
            <Button variant="outline" size="sm">
              <CalendarIcon class="size-4" />
              {#if searchParams.dateFrom && searchParams.dateTo}
                {searchParams.dateFrom} - {searchParams.dateTo}
              {:else}
                Date Range
              {/if}
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-124 p-0">
            <RangeCalendar
              numberOfMonths={2}
              class="rounded-lg border shadow-sm"
              bind:value={date}
            />
          </Popover.Content>
        </Popover.Root>

        <Popover.Root>
          <Popover.Trigger>
            <Button variant="outline" size="sm">
              <FilterIcon class="size-4" />
              Status
            </Button>
          </Popover.Trigger>
          <Popover.Content align="start" class="w-52 p-4">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <Checkbox
                  id="present"
                  checked={searchParams.status?.includes("PRESENT")}
                  onCheckedChange={(v) => {
                    if (v) {
                      searchParams.status = [...(searchParams.status || []), "PRESENT"];
                    } else {
                      searchParams.status = searchParams.status?.filter((s) => s !== "PRESENT");
                    }
                  }}
                />
                <Label for="present" class="cursor-pointer text-sm font-medium">Present</Label>
              </div>
              <div class="flex items-center space-x-3">
                <Checkbox
                  id="late"
                  checked={searchParams.status?.includes("LATE")}
                  onCheckedChange={(v) => {
                    if (v) {
                      searchParams.status = [...(searchParams.status || []), "LATE"];
                    } else {
                      searchParams.status = searchParams.status?.filter((s) => s !== "LATE");
                    }
                  }}
                />
                <Label for="late" class="cursor-pointer text-sm font-medium">Late</Label>
              </div>
              <div class="flex items-center space-x-3">
                <Checkbox
                  id="early_leave"
                  checked={searchParams.status?.includes("EARLY_LEAVE")}
                  onCheckedChange={(v) => {
                    if (v) {
                      searchParams.status = [...(searchParams.status || []), "EARLY_LEAVE"];
                    } else {
                      searchParams.status = searchParams.status?.filter((s) => s !== "EARLY_LEAVE");
                    }
                  }}
                />
                <Label for="early_leave" class="cursor-pointer text-sm font-medium"
                  >Early Leave</Label
                >
              </div>
              <div class="flex items-center space-x-3">
                <Checkbox
                  id="absent"
                  checked={searchParams.status?.includes("ABSENT")}
                  onCheckedChange={(v) => {
                    if (v) {
                      searchParams.status = [...(searchParams.status || []), "ABSENT"];
                    } else {
                      searchParams.status = searchParams.status?.filter((s) => s !== "ABSENT");
                    }
                  }}
                />
                <Label for="absent" class="cursor-pointer text-sm font-medium">Absent</Label>
              </div>
              <div class="flex items-center space-x-3">
                <Checkbox
                  id="incomplete"
                  checked={searchParams.status?.includes("INCOMPLETE")}
                  onCheckedChange={(v) => {
                    if (v) {
                      searchParams.status = [...(searchParams.status || []), "INCOMPLETE"];
                    } else {
                      searchParams.status = searchParams.status?.filter((s) => s !== "INCOMPLETE");
                    }
                  }}
                />
                <Label for="incomplete" class="cursor-pointer text-sm font-medium">Incomplete</Label
                >
              </div>
            </div>
          </Popover.Content>
        </Popover.Root>
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
