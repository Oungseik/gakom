<script lang="ts">
  import { Badge } from "@repo/ui/badge";
  import { Button } from "@repo/ui/button";
  import { Card } from "@repo/ui/card";

  import { goto } from "$app/navigation";

  import type { PageProps } from "./$types";

  const { data, params }: PageProps = $props();

  // Mock leave history
  const mockLeaveHistory = $state([
    {
      id: "1",
      dateRange: "Dec 15, 2024 - Dec 16, 2024",
      type: "Annual Leave",
      days: 2,
      status: "APPROVED" as const,
      createdAt: "Dec 10, 2024",
    },
    {
      id: "2",
      dateRange: "Jan 10, 2025 - Jan 15, 2025",
      type: "Sick Leave",
      days: 5,
      status: "PENDING" as const,
      createdAt: "Jan 8, 2025",
    },
    {
      id: "3",
      dateRange: "Dec 25, 2024 - Dec 25, 2024",
      type: "Public Holiday",
      days: 1,
      status: "APPROVED" as const,
      createdAt: "Dec 1, 2024",
    },
  ]);

  const mockLeaveBalance = $state({
    annual: { used: 12, total: 28 },
    sick: { used: 3, total: 14 },
    pending: 5,
  });

  const getStatusBadgeClass = (status: "PENDING" | "APPROVED" | "REJECTED") => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "PENDING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };
</script>

<svelte:head>
  <title>{data.organization.name} | Leave Management</title>
  <meta name="description" content="Apply for leave and track leave requests" />
</svelte:head>

<div class="container mx-auto space-y-6 p-4 md:p-6 lg:p-8">
  <div>
    <h1 class="text-2xl font-bold">Leave Management</h1>
    <p class="text-gray-600 dark:text-gray-400">Request leave and track your leave balance</p>
  </div>

  <!-- Apply Leave Button -->
  <Card class="p-6">
    <div class="text-center">
      <Button
        onclick={() => goto(`/app/${params.slug}/leave/apply`)}
        size="lg"
        class="px-8 py-6 text-lg"
      >
        Apply for Leave
      </Button>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Request new leave or view pending requests
      </p>
    </div>
  </Card>

  <!-- Leave Balance Summary -->
  <Card class="p-6">
    <h2 class="mb-4 text-xl font-semibold">Leave Balance</h2>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium">Annual Leave</span>
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >{mockLeaveBalance.annual.used}/{mockLeaveBalance.annual.total}</span
          >
        </div>
        <div class="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-3 rounded-full bg-blue-600 dark:bg-blue-400"
            style="width: {Math.round(
              (mockLeaveBalance.annual.used / mockLeaveBalance.annual.total) * 100
            )}%"
          ></div>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium">Sick Leave</span>
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >{mockLeaveBalance.sick.used}/{mockLeaveBalance.sick.total}</span
          >
        </div>
        <div class="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            class="h-3 rounded-full bg-red-600 dark:bg-red-400"
            style="width: {Math.round(
              (mockLeaveBalance.sick.used / mockLeaveBalance.sick.total) * 100
            )}%"
          ></div>
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-sm font-medium">Pending Requests</span>
          <span class="text-sm text-gray-600 dark:text-gray-400"
            >{mockLeaveBalance.pending} days</span
          >
        </div>
        <div class="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div class="h-3 rounded-full bg-amber-600 dark:bg-amber-400" style="width: 50%"></div>
        </div>
      </div>
    </div>
  </Card>

  <!-- Leave History List -->
  <Card class="p-6">
    <h2 class="mb-4 text-xl font-semibold">Leave History</h2>

    <div class="space-y-4">
      {#each mockLeaveHistory as leave}
        <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <div>
            <h3 class="font-medium">{leave.type}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {leave.dateRange} ({leave.days} days)
            </p>
            <p class="text-xs text-gray-500">Requested on {leave.createdAt}</p>
          </div>
          <Badge class={getStatusBadgeClass(leave.status)}>
            {leave.status}
          </Badge>
        </div>
      {/each}
    </div>
  </Card>
</div>
