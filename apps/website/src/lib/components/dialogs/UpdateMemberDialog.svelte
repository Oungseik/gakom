<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Select from "@repo/ui/select";
  import { createForm } from "@tanstack/svelte-form";
  import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";
  import { z } from "zod";

  import { orpc } from "$lib/orpc_client";
  import { formatTime } from "$lib/utils";

  type Props = {
    userId: string;
    name: string;
    email: string;
    position?: string | null;
    role: "member" | "admin" | "owner";
    attendancePolicyId?: string | null;
    open: boolean;
    slug: string;
  };

  let { open = $bindable(false), slug, ...member }: Props = $props();
  let isUpdating = $state(false);
  const queryClient = useQueryClient();

  const attendancePolicies = createQuery(() =>
    orpc.organizations.attendancesPolicies.list.queryOptions({
      input: { slug, pageSize: 100, cursor: 0 },
      enabled: !!slug,
    })
  );
  const allPolicies = $derived(attendancePolicies.data?.items.flatMap((item) => item) ?? []);
  const memberUpdate = createMutation(() => orpc.organizations.members.update.mutationOptions());

  const form = createForm(() => ({
    defaultValues: {
      position: member.position ?? null,
      role: member.role ?? null,
      attendancePolicyId: member.attendancePolicyId ?? null,
    },
    onSubmit: async ({ value }) => {
      isUpdating = true;

      memberUpdate.mutate(
        {
          userId: member.userId,
          slug,
          data: {
            attendancePolicyId: value.attendancePolicyId,
            position: value.position,
            role: value.role,
          },
        },
        {
          onSuccess: () => {
            toast.success("Successfully update user information");
            queryClient.invalidateQueries({ queryKey: orpc.organizations.members.list.key() });
            open = false;
            isUpdating = false;
          },
          onError: (error) => {
            toast.error(error.message);
          },
        }
      );
    },
  }));
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Update {member.name}</Dialog.Title>
    </Dialog.Header>

    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="position"
        validators={{
          onChange: ({ value }) => {
            const { error } = z.string().min(3).max(24).safeParse(value);
            return error?.issues?.at(0)?.message ?? undefined;
          },
        }}
      >
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Position</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="text"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="Software Engineer"
              required
              disabled={isUpdating}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="role">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Role</Label>
            <Select.Root
              type="single"
              name={field.name}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as "member" | "admin")}
              disabled={isUpdating || member.role === "owner"}
            >
              <Select.Trigger class="w-full">
                {field.state.value === "member"
                  ? "Member"
                  : field.state.value === "admin"
                    ? "Admin"
                    : "Owner"}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="member">Member</Select.Item>
                <Select.Item value="admin">Admin</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="attendancePolicyId">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Attendance Policy</Label>
            <Select.Root
              type="single"
              name={field.name}
              onValueChange={(value) => field.handleChange(value)}
              disabled={isUpdating || allPolicies.length === 0}
            >
              <Select.Trigger class="w-full">
                <span>
                  {#if field.state.value}
                    {@const p = allPolicies.find((p) => p.id === field.state.value)}
                    {p?.name}
                    {#if p}
                      <span class="text-muted-foreground"
                        >({formatTime(p.clockIn)} - {formatTime(p.clockOut)})</span
                      >
                    {/if}
                  {:else}
                    Select an attendance policy
                  {/if}
                </span>
              </Select.Trigger>
              <Select.Content>
                {#each allPolicies as p (p.id)}
                  <Select.Item value={p.id}>
                    {p.name}
                    <span class="text-muted-foreground"
                      >({formatTime(p.clockIn)} - {formatTime(p.clockOut)})</span
                    >
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        {/snippet}
      </form.Field>

      <Dialog.Footer>
        <Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
        <Button type="submit" disabled={isUpdating} class="w-17">
          {#if isUpdating}
            <Loader2Icon class="size-4 animate-spin" />
          {:else}
            Submit
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
