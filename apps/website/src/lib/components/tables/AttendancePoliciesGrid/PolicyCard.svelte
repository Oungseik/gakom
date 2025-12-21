<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import CopyIcon from "@lucide/svelte/icons/copy";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import EyeIcon from "@lucide/svelte/icons/eye";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import SquarePenIcon from "@lucide/svelte/icons/square-pen";
  import ToggleLeftIcon from "@lucide/svelte/icons/toggle-left";
  import ToggleRightIcon from "@lucide/svelte/icons/toggle-right";
  import TrashIcon from "@lucide/svelte/icons/trash";
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import { toast } from "svelte-sonner";

  import { formatDate, formatWorkdays } from "$lib/utils";

  import type { AttendancePolicy } from "./types";

  let {
    policy,
  }: {
    policy: AttendancePolicy;
  } = $props();

  const policyName = $derived(policy.name || "Unnamed Policy");

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const workingHours = $derived(`${formatTime(policy.clockIn)} - ${formatTime(policy.clockOut)}`);
  const formattedDate = $derived(formatDate(policy.updatedAt));

  const getRelativeTime = (date: Date): string | null => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return null;
  };

  const relativeTime = $derived(getRelativeTime(policy.updatedAt));

  function handleEdit() {
    toast.info(`Edit functionality for "${policyName}" will be implemented soon`);
  }

  function handleDuplicate() {
    toast.success(`Policy "${policyName}" duplicated successfully`);
    // TODO: Implement actual duplication logic
  }

  function handleToggleStatus() {
    const newStatus = policy.enabled ? "disabled" : "enabled";
    toast.success(`Policy "${policyName}" ${newStatus}`);
    // TODO: Implement actual toggle logic
  }

  function handleViewDetails() {
    toast.info(`Viewing details for "${policyName}"`);
    // TODO: Implement view details logic
  }

  function handleDelete() {
    confirmDelete({
      title: "Delete attendance policy",
      description: `Are you sure you want to delete "${policyName}"? This action cannot be undone.`,
      onConfirm: async () => {
        toast.success(`Policy "${policyName}" deleted successfully`);
        // TODO: Implement actual deletion logic
      },
    });
  }
</script>

<ConfirmDeleteDialog />

<Card.Root
  class="group transition-all duration-200 hover:shadow-lg {policy.enabled
    ? 'border-primary/20'
    : 'opacity-70'}"
>
  <Card.Header class="pb-3">
    <div class="flex items-start justify-between gap-2">
      <Card.Title class="text-lg">{policyName}</Card.Title>
      {#if policy.enabled}
        <Badge variant="default" class="text-xs">Enabled</Badge>
      {:else}
        <Badge variant="secondary" class="text-xs">Disabled</Badge>
      {/if}
    </div>
  </Card.Header>

  <Card.Content class="space-y-4">
    <!-- Schedule Information -->
    <div class="space-y-2.5">
      <div class="flex items-center gap-2.5">
        <CalendarIcon class="text-muted-foreground h-4 w-4 flex-shrink-0" />
        <span class="text-sm">{formatWorkdays(policy.workdays)}</span>
      </div>
      <div class="flex items-center gap-2.5">
        <ClockIcon class="text-muted-foreground h-4 w-4 flex-shrink-0" />
        <span class="text-sm">{workingHours}</span>
      </div>
      <div class="flex items-center gap-2.5">
        <GlobeIcon class="text-muted-foreground h-4 w-4 flex-shrink-0" />
        <span class="text-muted-foreground text-xs">{policy.timezone}</span>
      </div>
    </div>

    <!-- Updated At -->
    <div class="border-t pt-3">
      <div class="flex flex-col gap-0.5">
        <span class="text-muted-foreground text-xs">Updated: {formattedDate}</span>
        {#if relativeTime}
          <span class="text-muted-foreground text-xs">({relativeTime})</span>
        {/if}
      </div>
    </div>
  </Card.Content>

  <Card.Footer class="flex items-center gap-2 border-t bg-muted/30 pt-3">
    <Button variant="outline" size="sm" onclick={handleEdit} class="flex-1">
      <SquarePenIcon class="mr-2 h-4 w-4" />
      Edit
    </Button>
    <Button variant="outline" size="sm" onclick={handleDuplicate} class="flex-1">
      <CopyIcon class="mr-2 h-4 w-4" />
      Duplicate
    </Button>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Button {...props} variant="outline" size="sm" class="px-2">
            <EllipsisIcon class="h-4 w-4" />
            <span class="sr-only">More actions</span>
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" class="w-48">
        <DropdownMenu.Item onclick={handleToggleStatus}>
          {#if policy.enabled}
            <ToggleLeftIcon class="mr-2 h-4 w-4" />
            <span>Disable</span>
          {:else}
            <ToggleRightIcon class="mr-2 h-4 w-4" />
            <span>Enable</span>
          {/if}
        </DropdownMenu.Item>
        <DropdownMenu.Item onclick={handleViewDetails}>
          <EyeIcon class="mr-2 h-4 w-4" />
          <span>View Details</span>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item onclick={handleDelete} variant="destructive">
          <TrashIcon class="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Card.Footer>
</Card.Root>

