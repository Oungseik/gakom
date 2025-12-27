<script lang="ts">
  import { formatTime } from "$lib/utils";

  type Policy = {
    name: string;
    clockInSec: number;
    clockOutSec: number;
  };

  const { policy }: { policy?: Policy } = $props();
</script>

{#if policy}
  <div class="flex flex-col gap-1.5">
    <div class="text-foreground text-sm font-medium">
      {policy.name}
    </div>

    <span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize">
      <span class="text-muted-foreground">{formatTime(policy.clockInSec)}</span>
      <span class="text-muted-foreground font-medium">-</span>
      <span class="text-muted-foreground">{formatTime(policy.clockOutSec)}</span>
    </span>
  </div>
{:else}
  <div class="text-muted-foreground text-sm italic">N/A</div>
{/if}
