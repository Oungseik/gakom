<script lang="ts">
  import type { TimeZone } from "@repo/db/timezone";

  import { getTimeInTimezone } from "$lib/utils";

  type Props = {
    attendanceTimezone: TimeZone;
    checkInAt: Date | null;
    checkOutAt: Date | null;
  };

  const props: Props = $props();
</script>

{#if props.checkInAt}
  <div class="flex flex-col gap-1">
    <div class="flex items-center gap-2 text-sm">
      {getTimeInTimezone(props.attendanceTimezone, props.checkInAt, { hour12: true })} - {props.checkOutAt
        ? getTimeInTimezone(props.attendanceTimezone, props.checkOutAt, { hour12: true })
        : "N/A"}
    </div>
  </div>
{/if}
