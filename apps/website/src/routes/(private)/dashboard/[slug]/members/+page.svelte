<script lang="ts">
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import { Label } from "@repo/ui/label";
  import { Spinner } from "@repo/ui/spinner";
  import * as Tabs from "@repo/ui/tabs";
  import { createInfiniteQuery } from "@tanstack/svelte-query";
  import { useSearchParams } from "runed/kit";

  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import InviteMemberDialog from "$lib/components/dialogs/InviteMemberDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import DataTable from "$lib/components/tables/MembersTable/DataTable.svelte";
  import { columns } from "$lib/components/tables/MembersTable/columns";
  import { orpc } from "$lib/orpc_client";
  import { membersTabSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  let isInviteDialogOpen = $state(false);

  type View = { id: string; label: string; badge: number };

  let views: View[] = [
    { id: "members", label: "Members", badge: 0 },
    { id: "invitations", label: "Invitations", badge: 0 },
  ];

  const searchParams = useSearchParams(membersTabSchema);
  const members = createInfiniteQuery(() =>
    orpc.organizations.members.list.infiniteOptions({
      enabled: searchParams.tab === "members",
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 10, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allMembers = $derived(members.data?.pages.flatMap((page) => page.items) ?? []);
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Members", href: `/dashboard/${params.slug}/members` },
  ]}
/>

<DashboardContainer>
  <Tabs.Root bind:value={searchParams.tab} class="w-full flex-col justify-start gap-6">
    <div class="flex items-center justify-between">
      <Label for="view-selector" class="sr-only">View</Label>

      <Tabs.List
        class="**:data-[slot=badge]:bg-muted-foreground/30 flex **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex"
      >
        {#each views as view (view.id)}
          <Tabs.Trigger value={view.id}>
            {view.label}
            {#if view.badge > 0}
              <Badge variant="secondary">{view.badge}</Badge>
            {/if}
          </Tabs.Trigger>
        {/each}
      </Tabs.List>
      <div>
        <Button variant="outline" onclick={() => (isInviteDialogOpen = true)}>
          <UserPlusIcon size={4} />
          Invite</Button
        >
      </div>
    </div>

    {#if members.isFetching && !members.data}
      <div class="flex h-40 w-full items-center justify-center">
        <Spinner class="size-10" />
      </div>
    {:else if allMembers.length > 0}
      <Tabs.Content value="members" class="relative flex flex-col gap-4 overflow-auto">
        <DataTable
          {columns}
          data={allMembers.map((m) => ({ ...m, organizationId: data.currentOrganization.id }))}
        />

        {#if members.hasNextPage}
          <div class="flex items-center justify-center py-4">
            <Button
              variant="outline"
              onclick={() => members.fetchNextPage()}
              disabled={members.isFetchingNextPage}
            >
              {#if members.isFetchingNextPage}
                <Spinner class="mr-2 size-4" />
                Loading...
              {:else}
                Load More
              {/if}
            </Button>
          </div>
        {/if}
      </Tabs.Content>
    {:else}
      <Tabs.Content value="members" class="relative flex flex-col gap-4 overflow-auto">
        <DataTable {columns} data={[]} />
      </Tabs.Content>
    {/if}
  </Tabs.Root>
</DashboardContainer>

<InviteMemberDialog bind:open={isInviteDialogOpen} organization={data.currentOrganization} />
