<script lang="ts">
  import ListChecksIcon from "@lucide/svelte/icons/list-checks";
  import { Button } from "@repo/ui/button";
  import { Checkbox } from "@repo/ui/checkbox";
  import { Label } from "@repo/ui/label";
  import * as Popover from "@repo/ui/popover";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import RangeCalendarPopover from "$lib/components/inputs/RangeCalendarPopover.svelte";
  import Search from "$lib/components/inputs/Search.svelte";
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
  const debounceDateFrom = new Debounced(() => searchParams.dateFrom, 1000);
  const debounceDateTo = new Debounced(() => searchParams.dateTo, 1000);

  const attendances = createInfiniteQuery(() =>
    orpc.organizations.attendances.list.infiniteOptions({
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
    orpc.organizations.attendances.stats.get.queryOptions({
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
  <section class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
    {#if stats.isLoading}
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
      <h1 class="text-muted-foreground">Attendances</h1>

      <div class="flex flex-wrap gap-2">
        <Search bind:value={searchParams.search} />

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

        <div>
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="outline">
                <ListChecksIcon class="size-4" />
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
                        searchParams.status = searchParams.status?.filter(
                          (s) => s !== "EARLY_LEAVE"
                        );
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
                        searchParams.status = searchParams.status?.filter(
                          (s) => s !== "INCOMPLETE"
                        );
                      }
                    }}
                  />
                  <Label for="incomplete" class="cursor-pointer text-sm font-medium"
                    >Incomplete</Label
                  >
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>
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
