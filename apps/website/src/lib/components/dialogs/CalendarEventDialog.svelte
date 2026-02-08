<script lang="ts">
  import { CalendarDate } from "@internationalized/date";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { z } from "zod";

  import { orpc } from "$lib/orpc_client";
  import { formatDate } from "$lib/utils";

  type CalendarEvent = {
    id: string;
    calendarId: string;
    title: string;
    description: string | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
  };

  type Props = {
    open: boolean;
    event?: CalendarEvent | null;
    slug: string;
    calendarId: string;
  };

  let { open = $bindable(false), event = null, slug, calendarId }: Props = $props();
  let isSubmitting = $state(false);
  const queryClient = useQueryClient();

  const isEditing = $derived(!!event);

  const createEvent = createMutation(() => orpc.calendarEvents.create.mutationOptions());
  const updateEvent = createMutation(() => orpc.calendarEvents.update.mutationOptions());

  // Convert Date to CalendarDate for the picker
  function dateToCalendarDate(date: Date): CalendarDate {
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  const defaultValues = $derived({
    title: event?.title ?? "",
    description: event?.description ?? "",
    dateRange: event?.date
      ? { start: dateToCalendarDate(event.date), end: dateToCalendarDate(event.date) }
      : undefined,
  });

  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isSubmitting = true;

      if (!value.dateRange?.start) {
        toast.error("Please select a date");
        isSubmitting = false;
        return;
      }

      if (isEditing && event) {
        // When editing, only use the start date (no range support for editing)
        const eventDate = new Date(
          value.dateRange.start.year,
          value.dateRange.start.month - 1,
          value.dateRange.start.day
        );

        updateEvent.mutate(
          {
            slug,
            id: event.id,
            data: {
              title: value.title,
              description: value.description || undefined,
              date: eventDate,
              calendarId,
            },
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: () => {
              open = false;
              form.reset();
              toast.success(`Event "${value.title}" updated successfully.`);
              queryClient.invalidateQueries({ queryKey: orpc.calendarEvents.list.key() });
            },
            onSettled: () => {
              isSubmitting = false;
            },
          }
        );
      } else {
        // When creating, generate events for each day in the range
        const eventsData = [];
        const startDate = value.dateRange.start;
        const endDate = value.dateRange.end;

        if (endDate) {
          // Generate all dates in the range
          let currentDate = new CalendarDate(startDate.year, startDate.month, startDate.day);
          const finalDate = new CalendarDate(endDate.year, endDate.month, endDate.day);

          while (currentDate.compare(finalDate) <= 0) {
            eventsData.push({
              title: value.title,
              description: value.description || undefined,
              date: new Date(currentDate.year, currentDate.month - 1, currentDate.day),
              calendarId,
            });

            // Move to next day
            currentDate = currentDate.add({ days: 1 });
          }
        } else {
          // Single date event (no end date selected)
          eventsData.push({
            title: value.title,
            description: value.description || undefined,
            date: new Date(startDate.year, startDate.month - 1, startDate.day),
            calendarId,
          });
        }

        createEvent.mutate(
          {
            slug,
            data: eventsData,
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: () => {
              open = false;
              form.reset();
              const count = eventsData.length;
              toast.success(
                count === 1
                  ? `Event "${value.title}" created successfully.`
                  : `${count} events for "${value.title}" created successfully.`
              );
              queryClient.invalidateQueries({ queryKey: orpc.calendarEvents.list.key() });
            },
            onSettled: () => {
              isSubmitting = false;
            },
          }
        );
      }
    },
  }));
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{isEditing ? "Edit Event" : "Create Event"}</Dialog.Title>
      <Dialog.Description>
        {isEditing ? "Update the event details below." : "Create a new event for this calendar."}
      </Dialog.Description>
    </Dialog.Header>

    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) => {
            const { error } = z.string().min(1).max(200).safeParse(value);
            return error?.issues?.at(0)?.message ?? undefined;
          },
        }}
      >
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Title</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="text"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="e.g., Team Meeting"
              required
              disabled={isSubmitting}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="description">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Description</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="text"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="e.g., Weekly team sync meeting"
              disabled={isSubmitting}
            />
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="dateRange">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label>{isEditing ? "Date" : "Date Range"}</Label>
            <Popover.Root>
              <Popover.Trigger>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    variant="outline"
                    class="w-full justify-between font-normal"
                    disabled={isSubmitting}
                  >
                    {#if field.state.value?.start}
                      {formatDate(field.state.value.start.toDate("UTC"))}
                      {field.state.value.end &&
                        `- ${formatDate(field.state.value.end.toDate("UTC"))}`}
                    {:else}
                      <span class="text-muted-foreground">Select date</span>
                    {/if}
                    <ChevronDownIcon class="size-4" />
                  </Button>
                {/snippet}
              </Popover.Trigger>
              <Popover.Content class="w-auto overflow-hidden p-0" align="start">
                {#key field.state.value}
                  <RangeCalendar
                    value={field.state.value}
                    onValueChange={(value) => {
                      if (value?.start && value?.end) {
                        field.handleChange({
                          start: value.start as CalendarDate,
                          end: value.end as CalendarDate,
                        });
                      } else if (value?.start && !value?.end) {
                        field.handleChange({
                          start: value.start as CalendarDate,
                          end: null as unknown as CalendarDate,
                        });
                      } else {
                        field.handleChange(undefined);
                      }
                    }}
                    numberOfMonths={2}
                    captionLayout="dropdown"
                  />
                {/key}
              </Popover.Content>
            </Popover.Root>
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <Dialog.Footer>
        <Dialog.Close
          type="button"
          class={buttonVariants({ variant: "outline" })}
          disabled={isSubmitting}
        >
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={isSubmitting}>
          {#if isSubmitting}
            <Loader2Icon class="size-4 animate-spin" />
          {:else}
            {isEditing ? "Update" : "Create"}
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
