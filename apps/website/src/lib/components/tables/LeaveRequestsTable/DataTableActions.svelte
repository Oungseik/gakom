<script lang="ts">
  import CircleCheckBigIcon from "@lucide/svelte/icons/circle-check-big";
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import { Button } from "@repo/ui/button";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { orpc } from "$lib/orpc_client";

  type Props = { id: string; slug: string };

  let { id, slug }: Props = $props();

  const queryClient = useQueryClient();
  const approveRequest = createMutation(() =>
    orpc.organizations.leaveRequests.approve.mutationOptions()
  );
  const rejectLeaveRequest = createMutation(() =>
    orpc.organizations.leaveRequests.reject.mutationOptions()
  );

  function handleApproveLeaveRequest() {
    approveRequest.mutate(
      { id, slug },
      {
        onError: (error) => toast.error(error.message),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.organizations.leaveRequests.key() });
        },
      }
    );
  }
  function handleRejectLeaveRequest() {
    rejectLeaveRequest.mutate(
      { id, slug },
      {
        onError: (error) => toast.error(error.message),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.organizations.leaveRequests.key() });
        },
      }
    );
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <EllipsisIcon />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onclick={handleApproveLeaveRequest}>
      <CircleCheckBigIcon size="4" /> Approve
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={handleRejectLeaveRequest} variant="destructive">
      <CircleXIcon size="4" /> Reject
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
