<script lang="ts">
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import SkeletonStatsCard from "$lib/components/skeletons/SkeletonStatsCard.svelte";
  import LeaveStatistics from "$lib/components/statistics/LeaveStatistics.svelte";
  import { columns } from "$lib/components/tables/LeaveRequestsTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
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
  {#if stats.isLoading}
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
    </div>
  {:else if stats.data}
    <LeaveStatistics data={stats.data} />
  {/if}

  <DataTable
    {columns}
    data={allLeaveRequests.map((datum) => ({
      ...datum,
      status: datum.status.toLowerCase() as "pending" | "rejected" | "approved" | "cancelled",
    }))}
    loading={leaveRequests.isLoading}
  />

  {#if leaveRequests.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <LoadMoreBtn
        onclick={() => leaveRequests.fetchNextPage()}
        loading={leaveRequests.isFetchingNextPage}
        disabled={leaveRequests.isFetchingNextPage}
      />
    </div>
  {/if}
</DashboardContainer>
