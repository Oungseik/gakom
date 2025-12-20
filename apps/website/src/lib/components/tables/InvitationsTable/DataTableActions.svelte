<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import MailIcon from "@lucide/svelte/icons/mail";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button } from "@repo/ui/button";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { toast } from "svelte-sonner";

  let {
    invitationId,
    email,
    status,
  }: {
    invitationId: string;
    email: string;
    status: "pending" | "accepted" | "rejected" | "canceled";
  } = $props();

  function handleResendInvitation() {
    // Dummy implementation - show success toast
    toast.success(`Resent invitation to ${email}`);
  }

  function handleCancelInvitation() {
    // Dummy implementation - show success toast
    toast.success(`Cancelled invitation for ${email}`);
  }

  const canTakeAction = $derived(status === "pending");
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button {...props} variant="ghost" size="icon" class="relative size-8 p-0">
        <span class="sr-only">Open menu</span>
        <EllipsisIcon />
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    {#if canTakeAction}
      <DropdownMenu.Item onclick={handleResendInvitation}>
        <MailIcon size={16} class="mr-2" /> Resend Invitation
      </DropdownMenu.Item>
      <DropdownMenu.Item onclick={handleCancelInvitation} variant="destructive">
        <XIcon size={16} class="mr-2" /> Cancel Invitation
      </DropdownMenu.Item>
    {:else}
      <DropdownMenu.Item disabled>No actions available</DropdownMenu.Item>
    {/if}
  </DropdownMenu.Content>
</DropdownMenu.Root>
