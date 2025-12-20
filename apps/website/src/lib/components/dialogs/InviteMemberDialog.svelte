<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Select from "@repo/ui/select";
  import { createForm } from "@tanstack/svelte-form";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { authClient } from "$lib/auth_client";
  import { orpc } from "$lib/orpc_client";

  type Props = {
    open: boolean;
    organization: { id: string; name: string };
  };

  let { open = $bindable(false), organization }: Props = $props();
  let isInviting = $state(false);
  const queryClient = useQueryClient();

  const defaultValues: { role: "member" | "admin"; email: string } = { role: "member", email: "" };
  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isInviting = true;
      const { error } = await authClient.organization.inviteMember({
        organizationId: organization.id,
        email: value.email,
        role: value.role,
        resend: true,
      });

      if (error) {
        toast.error(error.message ?? "something went wrong while inviting member");
      } else {
        open = false;
        form.reset();
        toast.success(`Successfully invite ${value.email} to ${organization.name}.`);
      }

      await queryClient.invalidateQueries({ queryKey: orpc.organizations.invitations.list.key() });
      isInviting = false;
    },
  }));
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-[425px]">
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
      <form.Field name="email">
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

      <form.Field name="role">
        {#snippet children(field)}
          <div class="space-y-2">
            <Label for={field.name}>Role</Label>
            <Select.Root
              type="single"
              name={field.name}
              onValueChange={(value) => field.handleChange(value as "member" | "admin")}
              disabled={isInviting}
            >
              <Select.Trigger class="w-full">
                {field.state.value === "member" ? "Member" : "Admin"}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="member">Member</Select.Item>
                <Select.Item value="admin">Admin</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        {/snippet}
      </form.Field>

      <Dialog.Footer>
        <Dialog.Close class={buttonVariants({ variant: "outline" })}>Cancel</Dialog.Close>
        <Button type="submit" disabled={isInviting} class="w-17">
          {#if isInviting}
            <Loader2Icon class="mr-2 size-4 animate-spin" />
          {:else}
            Invite
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
