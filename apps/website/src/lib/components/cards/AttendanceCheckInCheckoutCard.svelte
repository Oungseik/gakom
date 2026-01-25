<script lang="ts">
  import type { AttendanceStatus } from "@repo/db";
  import type { TimeZone } from "@repo/db/timezone";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";

  import { formatTime, getTimeInTimezone } from "$lib/utils";

  type Props = {
    policy: {
      timezone: TimeZone;
      clockInSec: number;
      clockOutSec: number;
    };
    attendance: {
      status: AttendanceStatus;
      checkInAt: Date | null;
      checkOutAt: Date | null;
    } | null;
    disabled?: boolean;
    onCheckIn: () => void;
    onCheckOut: () => void;
  };

  const { attendance, policy, onCheckIn, onCheckOut, disabled = false }: Props = $props();
</script>

<Card.Root class="h-62">
  <Card.Header>
    <Card.Title class="text-muted-foreground">Today's Attendance</Card.Title>
  </Card.Header>
  <Card.Content class="space-y-4">
    <div>
      <div class="text-muted-foreground">
        Your attendance is
        <span>{formatTime(policy.clockInSec)}</span>
        <span class="text-muted-foreground font-medium">-</span>
        <span>{formatTime(policy.clockOutSec)}</span>
        in {policy.timezone.replace("_", "")} timezone.
      </div>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <p class="text-lg font-bold lg:text-xl">Checked In</p>
        <p class="text-lg font-bold lg:text-xl">Checked Out</p>
      </div>
      <div>
        <p class="text-lg font-bold lg:text-xl">
          {#if attendance?.checkInAt}
            {getTimeInTimezone(policy.timezone, attendance.checkInAt, { hour12: true })}
          {:else}
            -
          {/if}
        </p>

        <p class="text-lg font-bold lg:text-xl">
          {#if attendance?.checkOutAt}
            {getTimeInTimezone(policy.timezone, attendance.checkOutAt, { hour12: true })}
          {:else}
            -
          {/if}
        </p>
      </div>
    </div>
  </Card.Content>
  <Card.Footer>
    {#if !attendance?.checkInAt}
      <Button class="w-full" onclick={onCheckIn} {disabled}>Check in</Button>
    {:else}
      <Button class="w-full" onclick={onCheckOut} disabled={disabled || !!attendance.checkOutAt}
        >Check out</Button
      >
    {/if}
  </Card.Footer>
</Card.Root>
