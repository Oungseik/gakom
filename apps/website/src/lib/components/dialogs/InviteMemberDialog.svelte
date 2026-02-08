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
    open: boolean;
    organization: { id: string; name: string; slug: string };
  };

  let { open = $bindable(false), organization }: Props = $props();
  let isInviting = $state(false);
  const queryClient = useQueryClient();

  const attendancePolicies = createQuery(() =>
    orpc.attendancesPolicies.list.queryOptions({
      input: { slug: organization.slug, pageSize: 100, cursor: 0 },
    })
  );
  const allPolicies = $derived(attendancePolicies.data?.items ?? []);
  const sendInvitation = createMutation(() =>
    orpc.invitations.send.mutationOptions()
  );

  const defaultValues: {
    role: "MEMBER" | "ADMIN";
    email: string;
    position: string;
    attendancePolicyId?: string;
  } = {
    role: "MEMBER",
    email: "",
    position: "",
  };
  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isInviting = true;

      sendInvitation.mutate(
        {
          slug: organization.slug,
          email: value.email,
          role: value.role,
          position: value.position,
          attendancePolicyId: value.attendancePolicyId,
        },
        {
          onError: (error) => {
            toast.error(error.message);
          },
          onSuccess: () => {
            open = false;
            form.reset();
            toast.success(`Successfully invite ${value.email} to ${organization.name}.`);
            queryClient.invalidateQueries({ queryKey: orpc.invitations.list.key() });
          },
          onSettled: () => {
            isInviting = false;
          },
        }
      );
    },
  }));
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Invite member</Dialog.Title>
    </Dialog.Header>

    <form
      class="space-y-4"
      onsubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => {
            const { error } = z.email().safeParse(value);
            return error?.issues?.at(0)?.message ?? undefined;
          },
        }}
      >
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              type="email"
              onblur={field.handleBlur}
              onchange={(e) => field.handleChange(e.currentTarget.value)}
              placeholder="m@example.com"
              required
              disabled={isInviting}
            />
            {#if field.state.meta.errors.length}
              <p class="text-sm text-red-500">{field.state.meta.errors}</p>
            {/if}
          </div>
        {/snippet}
      </form.Field>

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
              disabled={isInviting}
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
              onValueChange={(value) => field.handleChange(value as "MEMBER" | "ADMIN")}
              disabled={isInviting}
            >
              <Select.Trigger class="w-full">
                {field.state.value === "MEMBER" ? "Member" : "Admin"}
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
              disabled={isInviting}
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
        <Button type="submit" disabled={isInviting} class="w-17">
          {#if isInviting}
            <Loader2Icon class="size-4 animate-spin" />
          {:else}
            Invite
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
