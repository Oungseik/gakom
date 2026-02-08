<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import EditIcon from "@lucide/svelte/icons/pencil";
  import StarIcon from "@lucide/svelte/icons/star";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import { Button } from "@repo/ui/button";
  import { Card, CardContent, CardHeader } from "@repo/ui/card";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import CalendarDialog from "$lib/components/dialogs/CalendarDialog.svelte";
  import { orpc } from "$lib/orpc_client";
  import { formatDate } from "$lib/utils";

  type Props = {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
  };

  let { id, name, isDefault, createdAt, updatedAt, slug }: Props = $props();

  let isEditDialogOpen = $state(false);
  const queryClient = useQueryClient();

  const setDefaultCalendar = createMutation(() => orpc.calendars.setDefault.mutationOptions());
  const deleteCalendar = createMutation(() => orpc.calendars.delete.mutationOptions());

  function handleEdit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    isEditDialogOpen = true;
  }

  function handleSetDefault(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (isDefault) {
      toast.info("This calendar is already the default.");
      return;
    }

    setDefaultCalendar.mutate(
      {
        slug,
        id,
      },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.calendars.list.key() });
          toast.success(`"${name}" is now the default calendar.`);
        },
      }
    );
  }

  function handleDelete(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    confirmDelete({
      title: "Delete Calendar",
      description: `Are you sure you want to delete the calendar "${name}"? This action cannot be undone.`,
      onConfirm: async () => {
        deleteCalendar.mutate(
          {
            slug,
            id,
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: orpc.calendars.list.key() });
              toast.success(`Calendar "${name}" deleted successfully.`);
            },
          }
        );
      },
    });
  }
</script>

<ConfirmDeleteDialog />

<Card class="group transition-shadow hover:shadow-md">
  <CardHeader class="pb-3">
    <div class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 items-start gap-3">
        <div class="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <CalendarIcon class="text-primary size-5" />
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="w-60 truncate leading-tight font-semibold">{name}</h3>
          {#if isDefault}
            <span
              class="bg-primary text-primary-foreground mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            >
              Default
            </span>
          {:else}
            <span class="text-muted-foreground mt-1 inline-flex items-center text-xs">
              Not default
            </span>
          {/if}
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
          onclick={handleSetDefault}
          disabled={isDefault}
          title={isDefault ? "Already default" : "Set as default"}
        >
          <StarIcon
            class={isDefault ? "fill-primary text-primary size-4" : "text-muted-foreground size-4"}
          />
        </Button>
        <Button variant="ghost" size="icon" class="size-8" onclick={handleEdit}>
          <EditIcon class="text-muted-foreground size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
          onclick={handleDelete}
          disabled={deleteCalendar.isPending}
        >
          <Trash2Icon class="text-destructive size-4" />
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent class="pt-0">
    <div class="text-muted-foreground flex items-center gap-4 text-xs">
      <div class="flex items-center gap-1.5">
        <ClockIcon class="size-3.5" />
        <span>Created {formatDate(createdAt)}</span>
      </div>
    </div>
  </CardContent>
</Card>

<CalendarDialog
  bind:open={isEditDialogOpen}
  calendar={{ id, name, isDefault, createdAt, updatedAt }}
  {slug}
/>
