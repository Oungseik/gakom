<script lang="ts">
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import { Card } from "@repo/ui/card";
  import { Progress } from "@repo/ui/progress";

  import { goto } from "$app/navigation";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import { formatTime } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const currentSlug = data.currentOrganization.slug;

  const attendance = $state<{
    status: "not_checked_in" | "checked_in" | "checked_out";
    checkInTime: string | null;
    checkOutTime: string | null;
  }>({
    status: "not_checked_in",
    checkInTime: null,
    checkOutTime: null,
  });

  const handleAttendanceAction = () => {
    if (attendance.status === "not_checked_in") {
      attendance.status = "checked_in";
      attendance.checkInTime = formatTime(new Date().getTime() / 1000);
    } else if (attendance.status === "checked_in") {
      attendance.status = "checked_out";
      attendance.checkOutTime = formatTime(new Date().getTime() / 1000);
    } else {
      attendance.status = "not_checked_in";
      attendance.checkInTime = null;
      attendance.checkOutTime = null;
    }
  };

  const getTaskStatusBadgeClass = (status: "pending" | "in_progress" | "done") => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    }
  };

  const mockTasks = $state([
    {
      id: "1",
      title: "Complete quarterly report",
      status: "in_progress" as const,
      dueDate: "2025-01-20",
      assignedBy: "Manager",
    },
    {
      id: "2",
      title: "Review team performance",
      status: "pending" as const,
      dueDate: "2025-01-22",
      assignedBy: "Supervisor",
    },
    {
      id: "3",
      title: "Update project documentation",
      status: "done" as const,
      dueDate: "2025-01-18",
      assignedBy: "Manager",
    },
  ]);

  const mockLeave = $state({ pendingRequests: 2, balance: "12 days used of 28", progress: 0.43 });

  const mockAnnouncements = $state([
    {
      id: "1",
      title: "Company Holiday Schedule 2025",
      content: "Holiday list released for 2025. Check HR portal for details.",
      date: "2025-01-15",
      author: "HR Dept",
      priority: "high",
    },
    {
      id: "2",
      title: "New Team Building Activity",
      content: "We will have a team building event this month at the central office.",
      date: "2025-01-16",
      author: "Management",
      priority: "normal",
    },
  ]);
</script>

<DashboardContainer>
  <Card class="p-6">
    <div class="text-center">
      <h2 class="mb-4 text-xl font-semibold">Today's Attendance</h2>
      <p class="mb-4 text-lg text-gray-600 dark:text-gray-400">
        {#if attendance.status === "not_checked_in"}
          Not checked in yet
        {:else if attendance.status === "checked_in"}
          Checked in at {attendance.checkInTime}
        {:else}
          Checked out at {attendance.checkOutTime}
        {/if}
      </p>
      <Button onclick={handleAttendanceAction} size="lg">
        {#if attendance.status === "not_checked_in"}
          Check In
        {:else if attendance.status === "checked_in"}
          Check Out
        {:else}
          Check In Again
        {/if}
      </Button>
    </div>
  </Card>

  <Card class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Today's Tasks</h2>
      <Button variant="link" onclick={() => goto(`/app/${currentSlug}/tasks`)}>View all</Button>
    </div>
    <div class="space-y-4">
      {#each mockTasks as task}
        <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div>
            <h3 class="font-medium">{task.title}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Due {task.dueDate} by {task.assignedBy}
            </p>
          </div>
          <Badge class={getTaskStatusBadgeClass(task.status)}>
            {task.status === "in_progress"
              ? "In Progress"
              : task.status === "done"
                ? "Done"
                : "Pending"}
          </Badge>
        </div>
      {/each}
    </div>
  </Card>

  <Card class="p-6">
    <h2 class="mb-4 text-xl font-semibold">Leave Status</h2>
    <div class="space-y-4">
      <div>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pending Requests: {mockLeave.pendingRequests}
        </p>
      </div>
      <div>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Leave Balance</p>
        <p class="mb-2">{mockLeave.balance}</p>
        <Progress value={mockLeave.progress * 100} class="h-2" />
      </div>
    </div>
  </Card>

  <Card class="p-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-semibold">Announcements</h2>
      <Button variant="link" onclick={() => goto(`/app/${currentSlug}/announcements`)}
        >View all</Button
      >
    </div>
    <div class="space-y-4">
      {#each mockAnnouncements as announcement}
        <div
          class="rounded-lg p-4 {announcement.priority === 'high'
            ? 'border-l-4 border-yellow-500'
            : 'border-l-1 border-gray-200'}"
        >
          <h3
            class={announcement.priority === "high"
              ? "font-medium text-yellow-800 dark:text-yellow-200"
              : "font-medium text-gray-900 dark:text-white"}
          >
            {announcement.title}
          </h3>
          <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">{announcement.content}</p>
          <p class="text-xs text-gray-500 dark:text-gray-500">
            {announcement.date} - {announcement.author}
          </p>
        </div>
      {/each}
    </div>
  </Card>
</DashboardContainer>
