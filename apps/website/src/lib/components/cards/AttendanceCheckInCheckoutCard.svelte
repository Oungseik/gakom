<script lang="ts">
  import type { AttendanceStatus } from "@repo/db";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";

  type Props = {
    attendance: {
      timezone: string;
      status: AttendanceStatus;
      checkInAt: Date | null;
      checkOutAt: Date | null;
    } | null;
    onCheckIn: () => void;
    onCheckOut: () => void;
  };

  const { attendance, onCheckIn, onCheckOut }: Props = $props();
</script>

<!-- TODO show the timezone in the UI -->
<Card.Root>
  <Card.Header>
    <Card.Title class="text-muted-foreground">Today's Attendance</Card.Title>
  </Card.Header>
  {#if !attendance}
    <Card.Content>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-muted-foreground text-sm">Status</p>
          <p class="text-lg font-bold lg:text-2xl">Not Checked In</p>
        </div>
      </div>
    </Card.Content>
    <Card.Footer class="flex items-center">
      <Button class="w-full" onclick={onCheckIn}>Check in</Button>
    </Card.Footer>
  {:else if attendance.checkInAt && !attendance.checkOutAt}
    {@const checkIn = attendance.checkInAt}
    <Card.Content>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-muted-foreground text-sm">Status</p>
          <p class="text-lg font-bold lg:text-2xl">Checked In</p>
        </div>
        <div>
          <p class="text-muted-foreground text-sm">Checked in at</p>
          <p class="text-lg font-bold lg:text-2xl">
            {checkIn.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
      </div>
    </Card.Content>
    <Card.Footer class="flex items-center">
      <Button class="w-full" onclick={onCheckOut}>Check out</Button>
    </Card.Footer>
  {:else if attendance.checkInAt && attendance.checkOutAt}
    {@const checkIn = attendance.checkInAt}
    {@const checkOut = attendance.checkOutAt}
    <Card.Content>
      <div class="flex items-center justify-between">
        <div>
          <p class="text-muted-foreground text-sm">Status</p>
          <p class="text-lg font-bold lg:text-2xl">Checked In</p>
          <p class="text-lg font-bold lg:text-2xl">Checked Out</p>
        </div>
        <div>
          <p class="text-muted-foreground text-sm">Checked in at</p>
          <p class="text-lg font-bold lg:text-2xl">
            {checkIn.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
          <p class="text-lg font-bold lg:text-2xl">
            {checkOut.toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            })}
          </p>
        </div>
      </div>
    </Card.Content>
  {/if}
</Card.Root>
