<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { Button } from "@repo/ui/button";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import CalendarEventDialog from "$lib/components/dialogs/CalendarEventDialog.svelte";
  import { orpc } from "$lib/orpc_client";

  type CalendarEvent = {
    id: string;
    calendarId: string;
    title: string;
    description: string | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
  };

  let {
    event,
    slug,
  }: {
    event: CalendarEvent;
    slug: string;
  } = $props();

  let isEditDialogOpen = $state(false);
  const queryClient = useQueryClient();

  const deleteEvent = createMutation(() => orpc.calendarEvents.delete.mutationOptions());

  function handleDelete() {
    confirmDelete({
      title: "Delete Event",
      description: `Are you sure you want to delete the event "${event.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        deleteEvent.mutate(
          {
            slug,
            id: event.id,
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: orpc.calendarEvents.list.key() });
              toast.success(`Event "${event.title}" deleted successfully.`);
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
    <DropdownMenu.Item onclick={() => (isEditDialogOpen = true)}>
      <PencilIcon size={16} class="mr-2" /> Edit
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item onclick={handleDelete} variant="destructive">
      <Trash2Icon size={16} class="mr-2" /> Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>

<CalendarEventDialog bind:open={isEditDialogOpen} {event} {slug} calendarId={event.calendarId} />
