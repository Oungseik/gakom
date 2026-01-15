<script lang="ts">
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import MailIcon from "@lucide/svelte/icons/mail";
  import { Button } from "@repo/ui/button";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { authClient } from "$lib/auth_client";
  import { orpc } from "$lib/orpc_client";

  let {
    status,
    ...props
  }: {
    invitationId: string;
    organizationId: string;
    email: string;
    position: string;
    role: "admin" | "member";
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
  } = $props();

  const queryClient = useQueryClient();

  async function handleResendInvitation() {
    const { error } = await authClient.organization.inviteMember({ ...props, resend: true });
    if (error) {
      return toast.error(error.message ?? "Something went wrong while resend invitation");
    }
    await queryClient.invalidateQueries({ queryKey: orpc.organizations.invitations.list.key() });
    toast.success(`Resent invitation to ${props.email}`);
  }

  async function handleCancelInvitation() {
    const { error } = await authClient.organization.cancelInvitation({
      invitationId: props.invitationId,
    });

    if (error) {
      return toast.error(error.message ?? "Something went wrong while cancel invitation");
    }

    await queryClient.invalidateQueries({ queryKey: orpc.organizations.invitations.list.key() });
    toast.success(`Cancelled invitation for ${props.email}`);
  }

  const canTakeAction = $derived(status !== "ACCEPTED");
</script>

{#if canTakeAction}
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
      <DropdownMenu.Item onclick={handleResendInvitation}>
        <MailIcon size={16} class="mr-2" /> Resend Invitation
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onclick={handleCancelInvitation}
        variant="destructive"
        disabled={status === "CANCELED"}
      >
        <CircleXIcon size={16} class="mr-2" /> Cancel Invitation
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
{/if}
