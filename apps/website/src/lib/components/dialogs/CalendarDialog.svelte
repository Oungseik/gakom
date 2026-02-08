<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { Switch } from "@repo/ui/switch";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { z } from "zod";

  import { orpc } from "$lib/orpc_client";

  type Calendar = {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  };

  type Props = {
    open: boolean;
    calendar?: Calendar | null;
    slug: string;
  };

  let { open = $bindable(false), calendar = null, slug }: Props = $props();
  let isSubmitting = $state(false);
  const queryClient = useQueryClient();

  const isEditing = $derived(!!calendar);

  const createCalendar = createMutation(() => orpc.calendars.create.mutationOptions());
  const updateCalendar = createMutation(() => orpc.calendars.update.mutationOptions());

  const defaultValues = $derived({
    name: calendar?.name ?? "",
    isDefault: calendar?.isDefault ?? false,
  });

  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isSubmitting = true;

      if (isEditing && calendar) {
        updateCalendar.mutate(
          {
            slug,
            id: calendar.id,
            data: {
              name: value.name,
              isDefault: value.isDefault,
            },
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: () => {
              open = false;
              form.reset();
              toast.success(`Calendar "${value.name}" updated successfully.`);
              queryClient.invalidateQueries({ queryKey: orpc.calendars.list.key() });
            },
            onSettled: () => {
              isSubmitting = false;
            },
          }
        );
      } else {
        createCalendar.mutate(
          {
            slug,
            data: {
              name: value.name,
              isDefault: value.isDefault,
            },
          },
          {
            onError: (error) => {
              toast.error(error.message);
            },
            onSuccess: () => {
              open = false;
              form.reset();
              toast.success(`Calendar "${value.name}" created successfully.`);
              queryClient.invalidateQueries({ queryKey: orpc.calendars.list.key() });
            },
            onSettled: () => {
              isSubmitting = false;
            },
          }
        );
      }
    },
  }));

  // Reset form when calendar changes
  $effect(() => {
    if (open) {
      form.reset();
    }
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{isEditing ? "Edit Calendar" : "Create Calendar"}</Dialog.Title>
      <Dialog.Description>
        {isEditing
          ? "Update the calendar details below."
          : "Create a new calendar for your organization."}
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
        name="name"
        validators={{
          onChange: ({ value }) => {
            const { error } = z.string().min(1).max(100).safeParse(value);
            return error?.issues?.at(0)?.message ?? undefined;
          },
        }}
      >
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Name</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="text"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="e.g., Engineering Team Calendar"
              required
              disabled={isSubmitting}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="isDefault">
        {#snippet children(field)}
          <div class="flex items-center space-x-2">
            <Switch
              id={field.name}
              name={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
              disabled={isSubmitting}
            />
            <Label for={field.name} class="cursor-pointer">Set as default calendar</Label>
          </div>
          <p class="text-muted-foreground text-sm">
            The default calendar will be automatically assigned to new members.
          </p>
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
