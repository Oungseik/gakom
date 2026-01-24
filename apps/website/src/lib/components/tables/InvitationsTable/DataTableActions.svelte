<script lang="ts">
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import MailIcon from "@lucide/svelte/icons/mail";
  import { Button } from "@repo/ui/button";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { orpc } from "$lib/orpc_client";

  let {
    status,
    ...props
  }: {
    invitationId: string;
    slug: string;
    email: string;
    position: string;
    role: "ADMIN" | "MEMBER" | "OWNER";
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
    attendancePolicyId?: string;
  } = $props();

  const cancelInvitation = createMutation(() =>
    orpc.organizations.invitations.cancel.mutationOptions()
  );
  const sendInvitation = createMutation(() =>
    orpc.organizations.invitations.send.mutationOptions()
  );
  const queryClient = useQueryClient();

  async function handleResendInvitation() {
    if (props.role === "OWNER") {
      return void toast.error("Unable to invite someone as owner");
    }

    sendInvitation.mutate(
      {
        email: props.email,
        slug: props.slug,
        position: props.position,
        role: props.role,
        attendancePolicyId: props.attendancePolicyId,
        resend: true,
      },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: orpc.organizations.invitations.list.key() });
          toast.success(`Resent invitation to ${props.email}`);
        },
      }
    );
  }

  async function handleCancelInvitation() {
    cancelInvitation.mutate(
      {
        invitationId: props.invitationId,
        slug: props.slug,
      },
      {
        onError: (error) => {
          toast.error(error.message);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: orpc.organizations.invitations.list.key() });
          toast.success(`Cancelled invitation for ${props.email}`);
        },
      }
    );
  }

  const canTakeAction = $derived(status === "PENDING");
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
