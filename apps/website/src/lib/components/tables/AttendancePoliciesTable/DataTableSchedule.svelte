<script lang="ts">
  import { formatTime } from "$lib/utils";

  type Props = {
    clockIn: number;
    clockOut: number;
    workdays: string[];
  };

  let { clockIn, clockOut, workdays }: Props = $props();
</script>

<div class="flex flex-col gap-1">
  <div class="flex items-center gap-2 text-sm">
    <span class="text-muted-foreground">{formatTime(clockIn)}</span>
    <span class="text-muted-foreground font-medium">-</span>
    <span class="text-muted-foreground">{formatTime(clockOut)}</span>
  </div>
  <div class="text-muted-foreground text-xs">{workdays.join(", ")}</div>
</div>
