<script lang="ts">
  import ClockIcon from "@lucide/svelte/icons/clock";
  import ListChecksIcon from "@lucide/svelte/icons/list-checks";
  import ListFilterIcon from "@lucide/svelte/icons/list-filter";
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
  import LeaveStatistics from "$lib/components/statistics/LeaveStatistics.svelte";
  import { columns } from "$lib/components/tables/LeaveRequestsTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { leaveRequestsFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  const searchParams = useSearchParams(leaveRequestsFilterSchema);
  const status = [
    { value: "PENDING" as const, label: "Pending" },
    { value: "REJECTED" as const, label: "Rejected" },
    { value: "APPROVED" as const, label: "Approved" },
    { value: "CANCELLED" as const, label: "Cancelled" },
  ];

  const debounceSearch = new Debounced(() => searchParams.search, 1000);
  const debounceStatus = new Debounced(() => searchParams.status, 1000);

  const leaveRequests = createInfiniteQuery(() =>
    orpc.leaveRequests.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        pageSize: 20,
        cursor,
        slug: params.slug,
        filter: {
          search: debounceSearch.current ?? undefined,
          status: debounceStatus.current ?? [],
        },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allLeaveRequests = $derived(leaveRequests.data?.pages.flatMap((page) => page.items) ?? []);
  const stats = createQuery(() =>
    orpc.leaveRequests.stats.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Leave", href: `/dashboard/${params.slug}/leave` },
  ]}
/>

<DashboardContainer>
  {#if stats.isLoading}
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
    </div>
  {:else if stats.data}
    <LeaveStatistics data={stats.data} />
  {/if}

  <section>
    <div class="my-4 space-y-2">
      <div class="flex flex-wrap gap-2">
        <Search bind:value={searchParams.search} />

        <div>
          <SelectDropdown
            icon={ClockIcon}
            desc="Duration"
            data={[
              { value: -1, label: "All" },
              { value: 1, label: "≤ 1 day" },
              { value: 3, label: "≤ 3 days" },
              { value: 5, label: "≤ 5 days" },
              { value: 6, label: "> 5 days" },
            ]}
            value={searchParams.duration}
            onCheckedChange={(value) => {
              searchParams.duration = value;
            }}
          />
        </div>

        <div>
          <SelectDropdown
            icon={ListChecksIcon}
            multiple
            desc="Status"
            data={status}
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
          <SelectDropdown
            icon={ListFilterIcon}
            desc="Leave type"
            data={[{ value: "all", label: "All" }].concat(
              data.leave.map(({ name }) => ({ value: name, label: name }))
            )}
            value={searchParams.leave}
            onCheckedChange={(value) => {
              searchParams.leave = value;
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

    <DataTable {columns} data={allLeaveRequests} loading={leaveRequests.isLoading} />

    {#if leaveRequests.hasNextPage}
      <div class="flex items-center justify-center py-4">
        <LoadMoreBtn
          onclick={() => leaveRequests.fetchNextPage()}
          loading={leaveRequests.isFetchingNextPage}
          disabled={leaveRequests.isFetchingNextPage}
        />
      </div>
    {/if}
  </section>
</DashboardContainer>
