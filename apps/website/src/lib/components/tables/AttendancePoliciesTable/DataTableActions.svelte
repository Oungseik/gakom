<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { Button } from "@repo/ui/button";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { orpc } from "$lib/orpc_client";

  import type { AttendancePolicy } from "./columns";

  type Props = {
    policy: AttendancePolicy;
    onEdit: (policy: AttendancePolicy) => void;
  };

  let { policy, onEdit }: Props = $props();
  const queryClient = useQueryClient();
  const deletePolicy = createMutation(() =>
    orpc.attendancesPolicies.delete.mutationOptions()
  );

  async function handleDelete() {
    confirmDelete({
      title: "Delete attendance policy",
      description: "Are you sure you want to delete this attendance policy?",
      onConfirm: async () => {
        deletePolicy.mutate(
          {
            id: policy.id,
            slug: policy.organizationId,
          },
          {
            onSuccess: () => {
              toast.success("Attendance policy deleted successfully");
              queryClient.invalidateQueries({
                queryKey: orpc.attendancesPolicies.list.key(),
              });
            },
            onError: (error) => {
              toast.error(error.message);
            },
          }
        );
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
  <DropdownMenu.Content align="end">
    <DropdownMenu.Item onclick={() => onEdit(policy)}>
      <SquarePenIcon size={16} class="mr-2" /> Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={handleDelete} variant="destructive">
      <TrashIcon size={16} class="mr-2" /> Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
