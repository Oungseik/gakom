<script lang="ts">
  import { Button } from "@repo/ui/button";
  import { Spinner } from "@repo/ui/spinner";
  import { createInfiniteQuery } from "@tanstack/svelte-query";

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
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Leave", href: `/dashboard/${params.slug}/leave` },
  ]}
/>

<DashboardContainer>
  {#if leaveRequests.isLoading}
    <div class="flex h-40 w-full items-center justify-center">
      <Spinner class="size-10" />
    </div>
  {:else if allLeaveRequests.length > 0}
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
