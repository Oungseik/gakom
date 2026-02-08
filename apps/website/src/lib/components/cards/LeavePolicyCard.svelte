<script lang="ts">
  import EditIcon from "@lucide/svelte/icons/edit";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { Button } from "@repo/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { orpc } from "$lib/orpc_client";

  type Props = {
    id: string;
    name: string;
    days: number;
    slug: string;
    onEdit: () => void;
    onDeleted: () => void;
  };

  let { id, name, days, slug, onEdit, onDeleted }: Props = $props();
  const queryClient = useQueryClient();

  const deletePolicy = createMutation(() => orpc.leave.delete.mutationOptions());

  function handleDelete() {
    confirmDelete({
      title: "Delete leave policy",
      description: "Are you sure you want to delete this leave policy?",
      onConfirm: async () => {
        deletePolicy.mutate(
          { id, slug },
          {
            onSuccess: () => {
              toast.success("Leave policy deleted successfully");
              onDeleted();
              queryClient.invalidateQueries({
                queryKey: orpc.leave.list.key(),
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

<Card>
  <CardHeader class="flex flex-row items-center justify-between space-y-0">
    <CardTitle class="text-lg font-medium">{name}</CardTitle>
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" onclick={onEdit}>
        <EditIcon class="size-4" />
      </Button>
      <Button variant="ghost" size="icon" onclick={handleDelete} disabled={deletePolicy.isPending}>
        <Trash2Icon class="text-destructive size-4" />
      </Button>
    </div>
  </CardHeader>
  <CardContent>
    <p class="text-muted-foreground text-sm">{days} days</p>
  </CardContent>
</Card>
