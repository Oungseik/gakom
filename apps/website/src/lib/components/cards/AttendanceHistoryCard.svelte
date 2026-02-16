<script lang="ts">
  import type { AttendanceStatus } from "@repo/db";
  import type { TimeZone } from "@repo/db/timezone";
  import { Badge } from "@repo/ui/badge";

  import { getAttendanceStatusBadgeClass, getTimeInTimezone } from "$lib/utils";

  type Props = {
    date: string;
    checkInAt: Date | null;
    checkOutAt: Date | null;
    status: AttendanceStatus;
    timezone: TimeZone;
  };

  const { date, checkInAt, checkOutAt, status, timezone }: Props = $props();
</script>

<div class="group border-border bg-card rounded-lg border px-4 py-2.5 transition-colors">
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
      <Badge class={getAttendanceStatusBadgeClass(status)}>
        {status.replace("_", " ")}
      </Badge>
    </div>
  </div>
</div>
