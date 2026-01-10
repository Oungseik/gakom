<script lang="ts">
  import { formatTime } from "$lib/utils";

  type Props = {
    clockInSec: number;
    clockOutSec: number;
    timezone: string;
  };

  let { clockInSec, clockOutSec, timezone }: Props = $props();
</script>

<div class="flex flex-col gap-1">
  <div class="flex items-center gap-2 text-sm">
    {timezone}
  </div>
  <div class="text-muted-foreground text-xs">
    <span>{formatTime(clockInSec)}</span>
    <span class="text-muted-foreground font-medium">-</span>
    <span>{formatTime(clockOutSec)}</span>
  </div>
</div>
