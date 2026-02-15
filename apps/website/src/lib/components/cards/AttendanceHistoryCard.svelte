<script lang="ts">
  import type { AttendanceStatus } from "@repo/db";
  import type { TimeZone } from "@repo/db/timezone";
  import { Badge } from "@repo/ui/badge";

  import { getAttendanceStatusBadgeClass, getTimeInTimezone } from "$lib/utils";

  type Props = {
    date: string;
    checkInAt: Date | null;
    checkOutAt: Date | null;
    workedSeconds: number | null;
    status: AttendanceStatus;
    timezone: TimeZone;
  };

  const { date, checkInAt, checkOutAt, workedSeconds, status, timezone }: Props = $props();

  function formatWorkHours(seconds: number | null): string {
    if (seconds === null) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
</script>

<div
  class="group border-border bg-card hover:bg-muted/50 rounded-lg border px-4 py-2.5 transition-colors"
>
  <div class="flex items-center justify-between gap-4">
    <div class="flex-1">
      <p class="font-semibold">{date}</p>
      <p class="text-muted-foreground text-sm">
        {checkInAt ? getTimeInTimezone(timezone, checkInAt, { hour12: true }) : "-"}
        -
        {checkOutAt ? getTimeInTimezone(timezone, checkOutAt, { hour12: true }) : "-"}
      </p>
    </div>
    <div class="flex items-center gap-3">
      <span class="text-muted-foreground text-xs tabular-nums"
        >{formatWorkHours(workedSeconds)}</span
      >
      <Badge class={getAttendanceStatusBadgeClass(status)}>
        {status.replace("_", " ")}
      </Badge>
    </div>
  </div>
</div>
