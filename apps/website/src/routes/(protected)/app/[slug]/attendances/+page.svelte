<script lang="ts">
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import { Card } from "@repo/ui/card";

  import { formatTime } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const attendanceState = $state<{
    status: "not_checked_in" | "checked_in" | "checked_out";
    checkInTime: string | null;
    checkOutTime: string | null;
  }>({
    status: "not_checked_in",
    checkInTime: null,
    checkOutTime: null,
  });

  const handleToggleAttendance = () => {
    if (attendanceState.status === "not_checked_in") {
      attendanceState.status = "checked_in";
      attendanceState.checkInTime = formatTime(new Date().getTime() / 1000);
    } else if (attendanceState.status === "checked_in") {
      attendanceState.status = "checked_out";
      attendanceState.checkOutTime = formatTime(new Date().getTime() / 1000);
    } else {
      attendanceState.status = "not_checked_in";
      attendanceState.checkInTime = null;
      attendanceState.checkOutTime = null;
    }
  };

  // Mock data for today's timeline
  const attendanceRecord = $state({
    checkIn: attendanceState.checkInTime,
    checkOut: attendanceState.checkOutTime,
    workingHours:
      attendanceState.checkInTime && attendanceState.checkOutTime
        ? `${Math.round((new Date().getTime() / 1000 - new Date(attendanceState.checkOutTime).getTime() / 1000) / 3600)} hours`
        : "0 hours",
  });

  const mockWeeklySummary = $state([
    { day: "Mon", status: "PRESENT" as const, hours: "8h" },
    { day: "Tue", status: "PRESENT" as const, hours: "8h" },
    { day: "Wed", status: "PRESENT" as const, hours: "8h" },
    { day: "Thu", status: "PRESENT" as const, hours: "8h" },
    { day: "Fri", status: "LATE" as const, hours: "7h" },
    { day: "Sat", status: "MISSED" as const, hours: "0h" },
    { day: "Sun", status: "MISSED" as const, hours: "0h" },
  ]);

  const getStatusBadgeClass = (status: "PRESENT" | "LATE" | "EARLY_LEAVE" | "MISSED") => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "LATE":
      case "EARLY_LEAVE":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "MISSED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
</script>

<svelte:head>
  <title>{data.organization.name} | Attendance</title>
  <meta name="description" content="Daily attendance check-in and check-out system" />
</svelte:head>

<div class="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
  <div>
    <h1 class="text-2xl font-bold">Attendance</h1>
    <p class="text-gray-600 dark:text-gray-400">Track your daily attendance</p>
  </div>

  <!-- Large Check In/Out Button -->
  <Card class="p-8">
    <div class="text-center">
      <div class="mb-6">
        <p class="mb-2 text-lg text-gray-600 dark:text-gray-400">Current Status</p>
        <Badge
          class={attendanceState.status === "checked_in"
            ? "bg-green-100 text-green-800"
            : attendanceState.status === "checked_out"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"}
        >
          {attendanceState.status === "not_checked_in"
            ? "Not Checked In"
            : attendanceState.status === "checked_in"
              ? "Checked In"
              : "Checked Out"}
        </Badge>
      </div>

      <Button onclick={handleToggleAttendance} size="lg" class="px-12 py-8 text-xl">
        {attendanceState.status === "not_checked_in"
          ? "Check In"
          : attendanceState.status === "checked_in"
            ? "Check Out"
            : "Check In Again"}
      </Button>
    </div>
  </Card>

  <!-- Today's Timeline -->
  <Card class="p-6">
    <h2 class="mb-4 text-xl font-semibold">Today's Timeline</h2>
    <div class="space-y-4">
      {#if attendanceRecord.checkIn}
        <div class="flex items-center space-x-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div class="h-3 w-3 rounded-full bg-green-500"></div>
          <div class="flex-1">
            <p class="font-medium text-gray-900 dark:text-white">Check In</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{attendanceRecord.checkIn}</p>
          </div>
        </div>
      {/if}

      {#if attendanceRecord.checkOut}
        <div class="flex items-center space-x-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div class="h-3 w-3 rounded-full bg-red-500"></div>
          <div class="flex-1">
            <p class="font-medium text-gray-900 dark:text-white">Check Out</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">{attendanceRecord.checkOut}</p>
          </div>
        </div>
      {/if}

      {#if attendanceState.status === "checked_in" || attendanceState.status === "checked_out"}
        <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            <span class="font-medium">Working Hours Today:</span>
            {attendanceRecord.workingHours}
          </p>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Weekly Summary -->
  <Card class="p-6">
    <h2 class="mb-4 text-xl font-semibold">This Week Summary</h2>
    <div class="grid grid-cols-7 gap-2">
      {#each mockWeeklySummary as day}
        <div class="text-center">
          <div class="mb-1 text-sm font-medium">{day.day}</div>
          <Badge class={getStatusBadgeClass(day.status)}>
            {day.status === "PRESENT" ? "✓" : day.status === "LATE" ? "T" : "✗"}
          </Badge>
          <div class="mt-1 text-xs text-gray-500">{day.hours}</div>
        </div>
      {/each}
    </div>
  </Card>

  <!-- Request Correction Link -->
  <Card class="p-6">
    <div class="text-center">
      <p class="text-gray-600 dark:text-gray-400">Wrong check-in/out time?</p>
      <Button variant="link">Request Correction</Button>
    </div>
  </Card>
</div>

