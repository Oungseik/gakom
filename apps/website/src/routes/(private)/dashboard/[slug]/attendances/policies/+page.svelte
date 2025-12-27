<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { Button } from "@repo/ui/button";
  import { Spinner } from "@repo/ui/spinner";
  import { createInfiniteQuery } from "@tanstack/svelte-query";

  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import AttendancePolicyDialog from "$lib/components/dialogs/AttendancePolicyDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import DataTable from "$lib/components/tables/AttendancePoliciesTable/DataTable.svelte";
  import {
    type AttendancePolicy,
    columns,
  } from "$lib/components/tables/AttendancePoliciesTable/columns";
  import { orpc } from "$lib/orpc_client";
  import { noop } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();
  let isDialogOpen = $state(false);
  let editingPolicy = $state<AttendancePolicy | null>(null);

  const policies = createInfiniteQuery(() =>
    orpc.organizations.attendancesPolicies.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 10, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
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
    { desc: "Attendances", href: `/dashboard/${params.slug}/attendances` },
    { desc: "Policies", href: `/dashboard/${params.slug}/attendances/policies` },
  ]}
/>

<DashboardContainer>
  <div class="flex items-center justify-between">
    <div></div>
    <Button onclick={handleCreate} variant="outline">
      <PlusIcon /> Create Policy
    </Button>
  </div>

  {#if policies.isLoading}
    <div class="flex h-40 w-full items-center justify-center">
      <Spinner class="size-10" />
    </div>
  {:else if allPolicies.length > 0}
    <DataTable
      columns={columns(handleEdit)}
      data={allPolicies.map((p) => ({
        ...p,
        organizationId: params.slug,
      }))}
    />
  {:else}
    <DataTable columns={columns(noop)} data={[]} />
  {/if}

  {#if policies.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <Button
        variant="outline"
        onclick={() => policies.fetchNextPage()}
        disabled={policies.isFetchingNextPage}
      >
        {#if policies.isFetchingNextPage}
          <Spinner class="mr-2 size-4" />
          Loading...
        {:else}
          Load More
        {/if}
      </Button>
    </div>
  {/if}
</DashboardContainer>

<AttendancePolicyDialog bind:open={isDialogOpen} slug={params.slug} policy={editingPolicy} />
