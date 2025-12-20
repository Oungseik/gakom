<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { Button } from "@repo/ui/button";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { toast } from "svelte-sonner";

  import { authClient } from "$lib/auth_client";

  let { email, organizationId }: { userId: string; organizationId: string; email: string } =
    $props();

  function handleRemoveMember() {
    confirmDelete({
      title: "Remove member",
      description: "Are you sure want to remove the member from the organization",
      onConfirm: async () => {
        const { error } = await authClient.organization.removeMember({
          organizationId,
          memberIdOrEmail: email,
        });

        if (error) {
          toast.error(
            error.message ?? "Something went wrong while remove member from the organization"
          );
        }
      },
    });
  }
</script>

<ConfirmDeleteDialog />

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <EllipsisIcon />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>
      <SquarePenIcon size="4" /> Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={handleRemoveMember} variant="destructive">
      <TrashIcon size="4" /> Remove member
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
