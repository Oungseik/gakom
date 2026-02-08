<script lang="ts">
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { Button } from "@repo/ui/button";
  import { createQuery } from "@tanstack/svelte-query";

  import LeavePolicyCard from "$lib/components/cards/LeavePolicyCard.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import LeavePolicyDialog from "$lib/components/dialogs/LeavePolicyDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  let { params }: PageProps = $props();

  let dialogOpen = $state(false);
  let editingPolicy = $state<{ id: string; name: string; days: number } | null>(null);

  const leavePolicies = createQuery(() =>
    orpc.leave.list.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );

  function handleEdit(policy: { id: string; name: string; days: number }) {
    editingPolicy = policy;
    dialogOpen = true;
  }

  function handleCreate() {
    editingPolicy = null;
    dialogOpen = true;
  }
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Leave", href: `/dashboard/${params.slug}/leave` },
    { desc: "Policies", href: `/dashboard/${params.slug}/leave/policies` },
  ]}
/>

<DashboardContainer>
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-2xl font-bold">Leave Policies</h1>
    <Button onclick={handleCreate} variant="outline">
      <PlusIcon class="mr-2 size-4" />
      New Policy
    </Button>
  </div>

  {#if leavePolicies.isLoading}
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each Array(3) as _}
        <div class="bg-muted/50 h-32 animate-pulse rounded-lg border"></div>
      {/each}
    </div>
  {:else if leavePolicies.isError}
    <p class="text-red-500">Failed to load leave policies</p>
  {:else if leavePolicies.data?.items && leavePolicies.data.items.length > 0}
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each leavePolicies.data.items as policy (policy.id)}
        <LeavePolicyCard
          id={policy.id}
          name={policy.name}
          days={policy.days}
          slug={params.slug}
          onEdit={() => handleEdit(policy)}
        />
      {/each}
    </div>
  {:else}
    <div class="rounded-lg py-12 text-center">
      <p class="text-muted-foreground">No leave policies yet</p>
    </div>
  {/if}
</DashboardContainer>

<LeavePolicyDialog bind:open={dialogOpen} slug={params.slug} policy={editingPolicy} />
