<script lang="ts">
  import { getRoleBadgeClass } from "$lib/utils";

  const { role, position } = $props();
</script>

<div class="flex flex-col gap-1.5">
  {#if position}
    <div class="text-foreground text-sm font-medium">
      {position}
    </div>
  {:else}
    <div class="text-muted-foreground text-sm italic">No position</div>
  {/if}
  <div>
    <span
      class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-gray-500/10 ring-inset {getRoleBadgeClass(
        role
      )}"
    >
      {role}
    </span>
  </div>
</div>
