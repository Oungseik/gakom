<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { Spinner } from "@repo/ui/spinner";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";

  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import DataTable from "$lib/components/tables/LeaveRequestsTable/DataTable.svelte";
  import { columns } from "$lib/components/tables/LeaveRequestsTable/columns";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();

  const leaveRequests = createInfiniteQuery(() =>
    orpc.organizations.leaveRequests.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 10, cursor, slug: params.slug }),
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
  {#if leaveRequests.isLoading || stats.isLoading}
    <div class="flex h-40 w-full items-center justify-center">
      <Spinner class="size-10" />
    </div>
  {:else}
    {#if stats.data}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-6">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Pending Requests</p>
              <p class="text-2xl font-bold">{stats.data.totalPendingRequests}</p>
            </div>
            <CheckIcon class="size-10 text-amber-500" />
          </Card.Content>
        </Card.Card>

        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-6">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Approved Today</p>
              <p class="text-2xl font-bold">{stats.data.totalApprovedToday}</p>
            </div>
            <CalendarIcon class="size-10 text-emerald-500" />
          </Card.Content>
        </Card.Card>

        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-6">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">On Leave Today</p>
              <p class="text-2xl font-bold">{stats.data.totalOnLeaveToday}</p>
            </div>
            <ClockIcon class="text-primary size-10" />
          </Card.Content>
        </Card.Card>
      </div>
    {/if}

    {#if allLeaveRequests.length > 0}
      <DataTable
        {columns}
        data={allLeaveRequests.map((datum) => ({
          ...datum,
          status: datum.status.toLowerCase() as "pending" | "rejected" | "approved" | "cancelled",
        }))}
      />
    {:else}
      <DataTable {columns} data={[]} />
    {/if}
  {/if}

  {#if leaveRequests.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <Button
        variant="outline"
        onclick={() => leaveRequests.fetchNextPage()}
        disabled={leaveRequests.isFetchingNextPage}
      >
        {#if leaveRequests.isFetchingNextPage}
          <Spinner class="mr-2 size-4" />
          Loading...
        {:else}
          Load More
        {/if}
      </Button>
    </div>
  {/if}
</DashboardContainer>
