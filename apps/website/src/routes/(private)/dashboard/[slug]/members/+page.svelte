<script lang="ts">
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import { Label } from "@repo/ui/label";
  import * as Table from "@repo/ui/table";
  import * as Tabs from "@repo/ui/tabs";

  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import InviteMemberDialog from "$lib/components/dialogs/InviteMemberDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  let isInviteDialogOpen = $state(false);

  type View = { id: string; label: string; badge: number };

  let views: View[] = [
    { id: "members", label: "Members", badge: 0 },
    { id: "invitations", label: "Invitations", badge: 1 },
  ];
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Members", href: `/dashboard/${params.slug}/members` },
  ]}
/>

<DashboardContainer>
  <Tabs.Root value="members" class="w-full flex-col justify-start gap-6">
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

    <Tabs.Content value="members" class="relative flex flex-col gap-4 overflow-auto">
      <div class="overflow-hidden rounded-lg border">
        <Table.Root>
          <Table.Header class="bg-muted sticky top-0 z-10">
            <Table.Row></Table.Row>
          </Table.Header>
        </Table.Root>
      </div>
    </Tabs.Content>
  </Tabs.Root>
</DashboardContainer>

<InviteMemberDialog bind:open={isInviteDialogOpen} organization={data.currentOrganization} />
