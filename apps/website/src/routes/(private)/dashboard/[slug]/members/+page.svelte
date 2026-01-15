<script lang="ts">
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import { Button } from "@repo/ui/button";
  import { Label } from "@repo/ui/label";
  import * as Tabs from "@repo/ui/tabs";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import MemberStatisticsCard from "$lib/components/cards/MemberStatisticsCard.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import InviteMemberDialog from "$lib/components/dialogs/InviteMemberDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import {
    type Invitation,
    type InvitationStatus,
    columns as invitationColumns,
  } from "$lib/components/tables/InvitationsTable/columns";
  import { columns } from "$lib/components/tables/MembersTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { membersTabSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  let isInviteDialogOpen = $state(false);

  type View = { id: string; label: string };

  const searchParams = useSearchParams(membersTabSchema);
  const members = createInfiniteQuery(() =>
    orpc.organizations.members.list.infiniteOptions({
      enabled: searchParams.tab === "members",
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 10, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const invitations = createInfiniteQuery(() =>
    orpc.organizations.invitations.list.infiniteOptions({
      enabled: searchParams.tab === "invitations",
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 10, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allMembers = $derived(members.data?.pages.flatMap((page) => page.items) ?? []);
  const allInvitations = $derived(
    invitations.data?.pages.flatMap((page) => page.items) ?? []
  ) as Invitation[];

  let views: View[] = $derived([
    { id: "members", label: "Members" },
    { id: "invitations", label: "Invitations" },
  ]);

  const stats = createQuery(() =>
    orpc.organizations.members.stats.get.queryOptions({ input: { slug: params.slug } })
  );

  const thisMonthTrend = $derived(
    stats.data?.lastMonthJoins
      ? Math.round(
          ((stats.data.thisMonthJoins - stats.data.lastMonthJoins) / stats.data.lastMonthJoins) *
            100
        )
      : undefined
  );
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Members", href: `/dashboard/${params.slug}/members` },
  ]}
/>

<DashboardContainer>
  {#if stats.isPending}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {#each Array(5) as _}
        <div class="bg-muted h-32 animate-pulse rounded-lg"></div>
      {/each}
    </div>
  {:else if stats.data}
    {@const data = stats.data}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <MemberStatisticsCard title="Total Members" value={data.totalMembers} icon="users" />
      <MemberStatisticsCard
        title="New This Month"
        value={data.thisMonthJoins}
        icon="user-plus"
        trend={thisMonthTrend}
      />
      <MemberStatisticsCard
        title="Joined Last Month"
        value={data.lastMonthJoins}
        icon="user-plus"
      />
      <MemberStatisticsCard title="Active Members" value={data.activeMembers} icon="users" />
      <MemberStatisticsCard title="Deactivated" value={data.deactivatedMembers} icon="user-minus" />
    </div>
  {/if}

  <Tabs.Root bind:value={searchParams.tab} class="w-full flex-col justify-start gap-6">
    <div class="flex items-center justify-between">
      <Label for="view-selector" class="sr-only">View</Label>

      <Tabs.List
        class="**:data-[slot=badge]:bg-muted-foreground/30 flex **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
      >
        {#each views as view (view.id)}
          <Tabs.Trigger value={view.id}>
            {view.label}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
      <div></div>
      <div>
        <Button variant="outline" onclick={() => (isInviteDialogOpen = true)}>
          <UserPlusIcon size={4} />
          Invite</Button
        >
      </div>
    </div>

    <Tabs.Content value="members">
      <DataTable
        {columns}
        data={allMembers.map((m) => ({
          ...m,
          organizationId: data.currentOrganization.id,
          slug: params.slug,
        }))}
        loading={members.isLoading}
      />

      {#if members.hasNextPage}
        <div class="flex items-center justify-center py-4">
          <LoadMoreBtn
            onclick={() => members.fetchNextPage()}
            loading={members.isFetchingNextPage}
            disabled={members.isFetchingNextPage}
          />
        </div>
      {/if}
    </Tabs.Content>

    <Tabs.Content value="invitations">
      <DataTable
        columns={invitationColumns}
        data={allInvitations.map((invitation) => ({
          ...invitation,
          status: invitation.status.toUpperCase() as InvitationStatus,
          organizationId: data.currentOrganization.id,
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
    </Tabs.Content>
  </Tabs.Root>
</DashboardContainer>

<InviteMemberDialog bind:open={isInviteDialogOpen} organization={data.currentOrganization} />
