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
    memberId: string;
    name: string;
    email: string;
    position?: string | null;
    role: "MEMBER" | "ADMIN" | "OWNER";
    attendancePolicyId?: string | null;
    leaveIds: string[];
    open: boolean;
    slug: string;
    calendarId: string | null;
  };

  let { open = $bindable(false), slug, ...props }: Props = $props();
  let isUpdating = $state(false);
  const queryClient = useQueryClient();

  const attendancePolicies = createQuery(() =>
    orpc.attendancesPolicies.list.queryOptions({
      input: { slug, pageSize: 100, cursor: 0 },
      enabled: !!slug,
    })
  );

  const leave = createQuery(() =>
    orpc.leave.list.queryOptions({
      input: { slug, pageSize: 100, cursor: 0 },
      enabled: !!slug,
    })
  );

  const calendars = createQuery(() =>
    orpc.calendars.list.queryOptions({
      input: { slug, pageSize: 100, cursor: 0 },
      enabled: !!slug,
    })
  );

  const allPolicies = $derived(attendancePolicies.data?.items ?? []);
  const allLeave = $derived(leave.data?.items ?? []);
  const allCalendars = $derived(calendars.data?.items ?? []);
  const memberUpdate = createMutation(() => orpc.members.update.mutationOptions());

  const form = createForm(() => ({
    defaultValues: {
      calendarId: props.calendarId,
      position: props.position ?? null,
      role: props.role ?? null,
      attendancePolicyId: props.attendancePolicyId ?? null,
      leaveIds: props.leaveIds,
    },
    onSubmit: async ({ value }) => {
      isUpdating = true;

      memberUpdate.mutate(
        {
          memberId: props.memberId,
          slug,
          data: {
            leaveIds: value.leaveIds,
            calendarId: value.calendarId,
            attendancePolicyId: value.attendancePolicyId,
            position: value.position,
            role: value.role,
          },
        },
        {
          onSuccess: () => {
            toast.success("Successfully update user information");
            queryClient.invalidateQueries({ queryKey: orpc.members.list.key() });
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
      <Dialog.Title>Update {props.name}</Dialog.Title>
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
              onValueChange={(value) => field.handleChange(value as "MEMBER" | "ADMIN")}
              disabled={isUpdating || props.role === "OWNER"}
            >
              <Select.Trigger class="w-full">
                {field.state.value === "MEMBER"
                  ? "Member"
                  : field.state.value === "ADMIN"
                    ? "Admin"
                    : "Owner"}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="MEMBER">Member</Select.Item>
                <Select.Item value="ADMIN">Admin</Select.Item>
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

      <form.Field name="leaveIds">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Leave Policies</Label>
            <Select.Root
              type="multiple"
              name={field.name}
              onValueChange={(value) => field.handleChange(value)}
              disabled={isUpdating || allPolicies.length === 0}
            >
              <Select.Trigger class="w-full">
                {#if allLeave.length === 0}
                  Not configured leave policies yet.
                {:else if field.state.value?.length === 0}
                  Select leave policies
                {:else}
                  <div class="flex gap-1 truncate">
                    {#each field.state.value as id (id)}
                      <div class="bg-secondary w-24 truncate rounded-md p-1 text-xs">
                        {allLeave.find((l) => l.id === id)?.name}
                      </div>
                    {/each}
                  </div>
                {/if}
              </Select.Trigger>
              <Select.Content>
                {#each allLeave as l (l.id)}
                  <Select.Item value={l.id}>
                    {l.name} <span class="text-muted-foreground text-sm"> - {l.days} day(s)</span>
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        {/snippet}
      </form.Field>

      <form.Field name="calendarId">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Calendar</Label>
            <Select.Root
              type="single"
              name={field.name}
              value={field.state.value ?? ""}
              onValueChange={(value) => field.handleChange(value || null)}
              disabled={isUpdating || allCalendars.length === 0}
            >
              <Select.Trigger class="w-full">
                <span>
                  {#if field.state.value}
                    {@const cal = allCalendars.find(
                      (c: (typeof allCalendars)[number]) => c.id === field.state.value
                    )}
                    {cal?.name}
                    {#if cal?.isDefault}
                      <span class="text-muted-foreground text-sm">(Default)</span>
                    {/if}
                  {:else}
                    No calendar assigned
                  {/if}
                </span>
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">No calendar</Select.Item>
                {#each allCalendars as cal (cal.id)}
                  <Select.Item value={cal.id}>
                    {cal.name}
                    {#if cal.isDefault}
                      <span class="text-muted-foreground text-sm">(Default)</span>
                    {/if}
                  </Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
        {/snippet}
      </form.Field>

      <Dialog.Footer>
        <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}
          >Cancel</Dialog.Close
        >
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
