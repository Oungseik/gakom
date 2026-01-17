<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import ListChecksIcon from "@lucide/svelte/icons/list-checks";
  import ListFilterIcon from "@lucide/svelte/icons/list-filter";
  import { Button } from "@repo/ui/button";
  import { Checkbox } from "@repo/ui/checkbox";
  import { Label } from "@repo/ui/label";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import RangeCalendarPopover from "$lib/components/inputs/RangeCalendarPopover.svelte";
  import Search from "$lib/components/inputs/Search.svelte";
  import SkeletonStatsCard from "$lib/components/skeletons/SkeletonStatsCard.svelte";
  import LeaveStatistics from "$lib/components/statistics/LeaveStatistics.svelte";
  import { columns } from "$lib/components/tables/LeaveRequestsTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { leaveRequestsFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  const searchParams = useSearchParams(leaveRequestsFilterSchema);

  const leaveRequests = createInfiniteQuery(() =>
    orpc.organizations.leaveRequests.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 20, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allLeaveRequests = $derived(leaveRequests.data?.pages.flatMap((page) => page.items) ?? []);
  const stats = createQuery(() =>
    orpc.organizations.leaveRequests.stats.get.queryOptions({
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
      <h1 class="text-muted-foreground">Leave requests</h1>

      <div class="flex flex-wrap gap-2">
        <Search bind:value={searchParams.search} />

        <div>
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="outline"><ClockIcon class="size-4" /> Duration</Button>
            </Popover.Trigger>
            <Popover.Content align="start" class="w-52 p-4">
              <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="one_day"
                    checked={searchParams.duration === 1}
                    onCheckedChange={() => {
                      searchParams.duration = 1;
                    }}
                  />
                  <Label for="one_day" class="cursor-pointer text-sm font-medium">&le; 1 day</Label>
                </div>
                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="three_days"
                    checked={searchParams.duration === 3}
                    onCheckedChange={() => {
                      searchParams.duration = 3;
                    }}
                  />
                  <Label for="three_days" class="cursor-pointer text-sm font-medium"
                    >&le; 3 days</Label
                  >
                </div>
                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="five_days"
                    checked={searchParams.duration === 5}
                    onCheckedChange={() => {
                      searchParams.duration = 5;
                    }}
                  />
                  <Label for="five_days" class="cursor-pointer text-sm font-medium"
                    >&le; 5 days</Label
                  >
                </div>

                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="greater_than_five"
                    checked={searchParams.duration === 9999}
                    onCheckedChange={() => {
                      searchParams.duration = 9999;
                    }}
                  />
                  <Label for="greater_than_five" class="cursor-pointer text-sm font-medium"
                    >&gt; 5 days</Label
                  >
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>
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
                    id="PENDING"
                    checked={searchParams.status?.includes("PENDING")}
                    onCheckedChange={(v) => {
                      if (v) {
                        searchParams.status = [...(searchParams.status || []), "PENDING"];
                      } else {
                        searchParams.status = searchParams.status?.filter((s) => s !== "PENDING");
                      }
                    }}
                  />
                  <Label for="PENDING" class="cursor-pointer text-sm font-medium">Pending</Label>
                </div>
                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="REJECTED"
                    checked={searchParams.status?.includes("REJECTED")}
                    onCheckedChange={(v) => {
                      if (v) {
                        searchParams.status = [...(searchParams.status || []), "REJECTED"];
                      } else {
                        searchParams.status = searchParams.status?.filter((s) => s !== "REJECTED");
                      }
                    }}
                  />
                  <Label for="REJECTED" class="cursor-pointer text-sm font-medium">Rejected</Label>
                </div>
                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="APPROVED"
                    checked={searchParams.status?.includes("APPROVED")}
                    onCheckedChange={(v) => {
                      if (v) {
                        searchParams.status = [...(searchParams.status || []), "APPROVED"];
                      } else {
                        searchParams.status = searchParams.status?.filter((s) => s !== "APPROVED");
                      }
                    }}
                  />
                  <Label for="APPROVED" class="cursor-pointer text-sm font-medium">Approved</Label>
                </div>
                <div class="flex items-center space-x-3">
                  <Checkbox
                    id="CANCELLED"
                    checked={searchParams.status?.includes("CANCELLED")}
                    onCheckedChange={(v) => {
                      if (v) {
                        searchParams.status = [...(searchParams.status || []), "CANCELLED"];
                      } else {
                        searchParams.status = searchParams.status?.filter((s) => s !== "CANCELLED");
                      }
                    }}
                  />
                  <Label for="CANCELLED" class="cursor-pointer text-sm font-medium">Cancelled</Label
                  >
                </div>
              </div>
            </Popover.Content>
          </Popover.Root>
        </div>

        <div>
          <Popover.Root>
            <Popover.Trigger>
              <Button variant="outline">
                <ListFilterIcon class="size-4" />
                Leave type
              </Button>
            </Popover.Trigger>
            <Popover.Content align="start" class="w-52 p-4">
              <div class="space-y-3">
                {#each data.leave as l (l.id)}
                  <div class="flex items-center space-x-3">
                    <Checkbox
                      id={l.id}
                      checked={searchParams.leave === l.name}
                      onCheckedChange={() => {
                        searchParams.leave = l.name;
                      }}
                    />
                    <Label for={l.id} class="cursor-pointer text-sm font-medium">{l.name}</Label>
                  </div>
                {/each}
              </div>
            </Popover.Content>
          </Popover.Root>
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
