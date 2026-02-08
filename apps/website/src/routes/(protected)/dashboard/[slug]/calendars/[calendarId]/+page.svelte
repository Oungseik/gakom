<script lang="ts">
  import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus";
  import Trash2Icon from "@lucide/svelte/icons/trash-2";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@repo/ui/button";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import { createInfiniteQuery, createMutation, useQueryClient } from "@tanstack/svelte-query";
  import type { RowSelectionState } from "@tanstack/table-core";
  import { toast } from "svelte-sonner";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import CalendarEventDialog from "$lib/components/dialogs/CalendarEventDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import { columns } from "$lib/components/tables/CalendarEventsTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();
  let isCreateDialogOpen = $state(false);
  let rowSelection = $state<RowSelectionState>({});
  const queryClient = useQueryClient();

  const events = createInfiniteQuery(() =>
    orpc.calendarEvents.list.infiniteOptions({
      enabled: !!params.slug && !!params.calendarId,
      initialPageParam: 0,
      input: (cursor) => ({
        pageSize: 20,
        cursor,
        slug: params.slug,
        filter: { calendarId: params.calendarId },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allEvents = $derived(events.data?.pages.flatMap((page) => page.items) ?? []);

  const eventsWithSlug = $derived(
    allEvents.map((event) => ({
      ...event,
      slug: params.slug,
    }))
  );

  const selectedEvents = $derived(
    Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((key) => eventsWithSlug.find((e) => e.id === key))
      .filter(Boolean)
  );

  const selectedCount = $derived(selectedEvents.length);

  const deleteEvent = createMutation(() => orpc.calendarEvents.delete.mutationOptions());

  function handleBulkDelete() {
    if (selectedCount === 0) return;

    confirmDelete({
      title: `Delete ${selectedCount} Event${selectedCount > 1 ? "s" : ""}`,
      description: `Are you sure you want to delete ${selectedCount} selected event${selectedCount > 1 ? "s" : ""}? This action cannot be undone.`,
      onConfirm: async () => {
        const promises = selectedEvents.map((event) =>
          deleteEvent.mutateAsync({
            slug: params.slug,
            id: event!.id,
          })
        );

        try {
          await Promise.all(promises);
          toast.success(
            `${selectedCount} event${selectedCount > 1 ? "s" : ""} deleted successfully.`
          );
          rowSelection = {};
          queryClient.invalidateQueries({ queryKey: orpc.calendarEvents.list.key() });
        } catch (error) {
          toast.error("Failed to delete some events.");
        }
      },
    });
  }

  function clearSelection() {
    rowSelection = {};
  }
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Calendars", href: `/dashboard/${params.slug}/calendars` },
    { desc: "Events", href: `/dashboard/${params.slug}/calendars/${params.calendarId}` },
  ]}
/>

<ConfirmDeleteDialog />

<DashboardContainer>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <h1 class="text-muted-foreground">{data.calendar?.name ?? "Calendar"} Events</h1>
    </div>
    <Button variant="outline" onclick={() => (isCreateDialogOpen = true)}>
      <CalendarPlusIcon size={16} class="mr-2" />
      Create Event
    </Button>
  </div>

  {#if selectedCount > 0}
    <div class="bg-muted/50 flex items-center justify-between rounded-md border px-4 py-2">
      <span class="text-sm">
        {selectedCount} event{selectedCount > 1 ? "s" : ""} selected
      </span>
      <div class="flex items-center gap-2">
        <Button variant="ghost" size="sm" onclick={clearSelection}>
          <XIcon size={16} class="mr-2" />
          Clear
        </Button>
        <Button variant="destructive" size="sm" onclick={handleBulkDelete}>
          <Trash2Icon size={16} class="mr-2" />
          Delete
        </Button>
      </div>
    </div>
  {/if}

  <DataTable {columns} data={eventsWithSlug} loading={events.isLoading} bind:rowSelection />

  {#if events.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <LoadMoreBtn
        onclick={() => events.fetchNextPage()}
        loading={events.isFetchingNextPage}
        disabled={events.isFetchingNextPage}
      />
    </div>
  {/if}
</DashboardContainer>

<CalendarEventDialog
  bind:open={isCreateDialogOpen}
  slug={params.slug}
  calendarId={params.calendarId}
/>
