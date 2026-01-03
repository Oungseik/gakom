<script lang="ts">
  import CircleCheckBigIcon from "@lucide/svelte/icons/circle-check-big";
  import CircleXIcon from "@lucide/svelte/icons/circle-x";
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import { Button } from "@repo/ui/button";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";

  type Props = {};

  let {}: Props = $props();

  function handleApproveLeaveRequest() {}
  function handleRejectLeaveRequest() {}
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
    <DropdownMenu.Item onclick={handleApproveLeaveRequest}>
      <CircleCheckBigIcon size="4" /> Approve
    </DropdownMenu.Item>
    <DropdownMenu.Item onclick={handleRejectLeaveRequest} variant="destructive">
      <CircleXIcon size="4" /> Reject
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
