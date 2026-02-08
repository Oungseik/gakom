<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { Button } from "@repo/ui/button";
  import { createInfiniteQuery } from "@tanstack/svelte-query";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import AttendancePolicyDialog from "$lib/components/dialogs/AttendancePolicyDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import {
    type AttendancePolicy,
    columns,
  } from "$lib/components/tables/AttendancePoliciesTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();
  let isDialogOpen = $state(false);
  let editingPolicy = $state<AttendancePolicy | null>(null);

  const policies = createInfiniteQuery(() =>
    orpc.attendancesPolicies.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 20, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allPolicies = $derived(policies.data?.pages.flatMap((page) => page.items) ?? []);

  function handleEdit(policy: AttendancePolicy) {
    editingPolicy = policy;
    isDialogOpen = true;
  }

  async function handleCreate() {
    editingPolicy = null;
    isDialogOpen = true;
  }
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Attendance Policies", href: `/dashboard/${params.slug}/attendances/policies` },
  ]}
/>

<DashboardContainer>
  <div class="flex items-center justify-between">
    <h1 class="text-muted-foreground">Attendance Policies</h1>
    <Button onclick={handleCreate} variant="outline">
      <PlusIcon /> Create Policy
    </Button>
  </div>

  <DataTable
    columns={columns(handleEdit)}
    data={allPolicies.map((p) => ({
      ...p,
      organizationId: params.slug,
    }))}
    loading={policies.isLoading}
  />

  {#if policies.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <LoadMoreBtn
        onclick={() => policies.fetchNextPage()}
        loading={policies.isFetchingNextPage}
        disabled={policies.isFetchingNextPage}
      />
    </div>
  {/if}
</DashboardContainer>

<AttendancePolicyDialog bind:open={isDialogOpen} slug={params.slug} policy={editingPolicy} />
