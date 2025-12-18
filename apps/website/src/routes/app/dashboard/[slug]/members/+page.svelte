<script lang="ts">
  import { Button } from "@repo/ui/button";

  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import InviteMemberDialog from "$lib/components/dialogs/InviteMemberDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  let isInviteDialogOpen = $state(false);
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/app/dashboard/${params.slug}` },
    { desc: "Members", href: `/app/dashboard/${params.slug}/members` },
  ]}
>
  {#snippet actions()}
    <div>
      <Button variant="outline" onclick={() => (isInviteDialogOpen = true)}>Invite</Button>
    </div>
  {/snippet}
</DashboardHeader>

<DashboardContainer>
  <h1>Hello</h1>
</DashboardContainer>

<InviteMemberDialog bind:open={isInviteDialogOpen} organization={data.currentOrganization} />
