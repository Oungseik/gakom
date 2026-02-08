<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { Button } from "@repo/ui/button";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import UpdateMemberDialog from "$lib/components/dialogs/UpdateMemberDialog.svelte";
  import { orpc } from "$lib/orpc_client";

  type Props = {
    userId: string;
    memberId: string;
    email: string;
    organizationId: string;
    slug: string;
    name: string;
    position?: string | null;
    role: "MEMBER" | "ADMIN" | "OWNER";
    attendancePolicyId?: string | null;
    leaveIds: string[];
    calendarId: string | null;
  };

  let { email, slug, organizationId, position, ...props }: Props = $props();
  let open = $state(false);

  const queryClient = useQueryClient();
  const removeMember = createMutation(() => orpc.members.remove.mutationOptions());

  function handleRemoveMember() {
    confirmDelete({
      title: "Remove member",
      description: "Are you sure want to remove the member from the organization",
      onConfirm: async () => {
        removeMember.mutate(
          { slug, userId: props.userId },
          {
            onError: (error) =>
              toast.error(
                error.message ?? "Something went wrong while remove member from the organization"
              ),
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: orpc.members.key() });
              queryClient.invalidateQueries({ queryKey: orpc.leaveRequests.key() });
            },
          }
        );
      },
    });
  }
</script>

<ConfirmDeleteDialog />
<UpdateMemberDialog bind:open {...{ email, slug, position, ...props }} />

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
    <DropdownMenu.Item
      onclick={() => {
        open = true;
      }}
    >
      <SquarePenIcon size="4" /> Edit
    </DropdownMenu.Item>

    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={handleRemoveMember} variant="destructive">
      <TrashIcon size="4" /> Remove member
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
