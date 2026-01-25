<script lang="ts">
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import { Button } from "@repo/ui/button";
  import { createInfiniteQuery } from "@tanstack/svelte-query";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import InviteMemberDialog from "$lib/components/dialogs/InviteMemberDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import { type Invitation, columns } from "$lib/components/tables/InvitationsTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  let isInviteDialogOpen = $state(false);

  const invitations = createInfiniteQuery(() =>
    orpc.organizations.invitations.list.infiniteOptions({
      enabled: !!params.slug,
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 20, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allInvitations = $derived(
    invitations.data?.pages.flatMap((page) => page.items) ?? []
  ) as Invitation[];
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Invitations", href: `/dashboard/${params.slug}/invitations` },
  ]}
/>

<DashboardContainer>
  <div class="flex items-center justify-between">
    <h1 class="text-muted-foreground">Invitations</h1>
    <Button variant="outline" onclick={() => (isInviteDialogOpen = true)}>
      <UserPlusIcon size={4} />
      Invite</Button
    >
  </div>

  <DataTable
    {columns}
    data={allInvitations.map((invitation) => ({
      ...invitation,
      slug: params.slug,
      organizationId: data.organization.id,
    }))}
    loading={invitations.isLoading}
  />

  {#if invitations.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <LoadMoreBtn
        onclick={() => invitations.fetchNextPage()}
        loading={invitations.isFetchingNextPage}
        disabled={invitations.isFetchingNextPage}
      />
    </div>
  {/if}
</DashboardContainer>

<InviteMemberDialog bind:open={isInviteDialogOpen} organization={data.organization} />
