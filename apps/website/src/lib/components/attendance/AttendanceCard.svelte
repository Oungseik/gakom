<script lang="ts">
  import ClockIcon from "@lucide/svelte/icons/clock";
  import LogInIcon from "@lucide/svelte/icons/log-in";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import * as Avatar from "@repo/ui/avatar";
  import { Button } from "@repo/ui/button";
  import { Card, CardContent, CardHeader } from "@repo/ui/card";

  import { getNameIntials } from "$lib/utils";

  import { mockAttendance } from "./attendance-mock-data";

  type Props = {
    user: { name: string; image?: string | null };
  };

  const { user }: Props = $props();

  const { firstWord, secondWord } = $derived(getNameIntials(user.name));

  const currentHour = $derived.by(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const currentDate = $derived.by(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const workingHoursText = $derived.by(() => {
    if (mockAttendance.status === "checked-in" && mockAttendance.todayHours) {
      return `${mockAttendance.todayHours.toFixed(1)} hours today`;
    }
    if (mockAttendance.status === "checked-out" && mockAttendance.todayHours) {
      return `${mockAttendance.todayHours.toFixed(1)} hours worked`;
    }
    return "No hours recorded yet";
  });
</script>

<Card>
  <CardHeader>
    <div class="flex items-center gap-3">
      <Avatar.Root class="size-12 rounded-lg">
        <Avatar.Image src={user.image} alt={user.name} />
        <Avatar.Fallback class="rounded-lg">{firstWord}{secondWord}</Avatar.Fallback>
      </Avatar.Root>
      <div>
        <h1 class="text-lg">{currentHour}, {user.name}</h1>
        <p class="text-muted-foreground text-sm">{currentDate}</p>
      </div>
    </div>
  </CardHeader>
  <CardContent class="space-y-6">
    <!-- Check-in/Check-out Times -->
    <div class="grid grid-cols-2 gap-4 rounded-lg border p-4">
      <div class="flex flex-col items-center">
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          <LogInIcon class="h-4 w-4" />
          <span>Check In</span>
        </div>
        <p class="mt-1 text-lg font-semibold">
          {mockAttendance.checkInTime ?? "--:--"}
        </p>
        <p class="text-muted-foreground text-xs">
          Expected: {mockAttendance.expectedCheckIn}
        </p>
      </div>

      <div class="flex flex-col items-center border-l">
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          <LogOutIcon class="h-4 w-4" />
          <span>Check Out</span>
        </div>
        <p class="mt-1 text-lg font-semibold">
          {mockAttendance.checkOutTime ?? "--:--"}
        </p>
        <p class="text-muted-foreground text-xs">
          Expected: {mockAttendance.expectedCheckOut}
        </p>
      </div>
    </div>

    <!-- Working Hours -->
    <div class="bg-muted/50 flex items-center justify-between rounded-lg p-3">
      <div class="flex items-center gap-2">
        <ClockIcon class="text-muted-foreground h-5 w-5" />
        <span class="text-sm font-medium">Working Hours</span>
      </div>
      <span class="text-sm font-semibold">{workingHoursText}</span>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-2 gap-3">
      <Button
        class="w-full"
        disabled={mockAttendance.status === "checked-in"}
        variant={mockAttendance.status === "checked-in" ? "secondary" : "default"}
      >
        <LogInIcon class="mr-2 h-4 w-4" />
        Check In
      </Button>
      <Button
        class="w-full"
        disabled={mockAttendance.status !== "checked-in"}
        variant={mockAttendance.status === "checked-in" ? "default" : "secondary"}
      >
        <LogOutIcon class="mr-2 h-4 w-4" />
        Check Out
      </Button>
    </div>
  </CardContent>
</Card>
