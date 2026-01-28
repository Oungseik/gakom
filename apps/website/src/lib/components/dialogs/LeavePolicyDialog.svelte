<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { z } from "zod";

  import { orpc } from "$lib/orpc_client";

  type Props = {
    open: boolean;
    slug: string;
    policy?: {
      id: string;
      name: string;
      days: number;
    } | null;
  };

  let { open = $bindable(false), slug, policy }: Props = $props();
  let isSubmitting = $state(false);
  const queryClient = useQueryClient();

  const isEditMode = $derived(!!policy);

  const leavePolicyUpdate = createMutation(() => orpc.organizations.leave.update.mutationOptions());
  const leavePolicyCreate = createMutation(() => orpc.organizations.leave.create.mutationOptions());

  const defaultValues = $derived({
    name: policy?.name ?? "",
    days: policy?.days ?? 0,
  });

  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isSubmitting = true;

      if (policy) {
        updateLeavePolicy(policy.id, value);
      } else {
        createLeavePolicy(value);
      }

      isSubmitting = false;
    },
  }));

  function createLeavePolicy(data: { name: string; days: number }) {
    leavePolicyCreate.mutate(
      { data, slug },
      {
        onSuccess: () => {
          toast.success("Successfully created leave policy");
          queryClient.invalidateQueries({
            queryKey: orpc.organizations.leave.list.key(),
          });
          open = false;
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }

  function updateLeavePolicy(id: string, data: { name: string; days: number }) {
    leavePolicyUpdate.mutate(
      { id, data, slug },
      {
        onSuccess: () => {
          toast.success("Successfully updated leave policy");
          queryClient.invalidateQueries({
            queryKey: orpc.organizations.leave.list.key(),
          });
          open = false;
        },
        onError: (error) => toast.error(error.message),
      }
    );
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header class="mb-4">
      <Dialog.Title>{isEditMode ? "Edit leave policy" : "New leave policy"}</Dialog.Title>
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
              placeholder="Annual Leave"
              required
              disabled={isSubmitting}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <form.Field
        name="days"
        validators={{
          onChange: ({ value }) => {
            const { error } = z.number().positive().safeParse(value);
            return error?.issues?.at(0)?.message ?? undefined;
          },
        }}
      >
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Days</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="number"
              min="0"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.valueAsNumber)}
              placeholder="10"
              required
              disabled={isSubmitting}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <Dialog.Footer>
        <Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
        <Button type="submit" disabled={isSubmitting} class="w-20">
          {#if isSubmitting}
            <Loader2Icon class="size-4 animate-spin" />
          {:else}
            {isEditMode ? "Update" : "Create"}
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
