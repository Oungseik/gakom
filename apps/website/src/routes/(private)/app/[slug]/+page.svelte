<script lang="ts">
  import { Button } from "@repo/ui/button";
  import { Card } from "@repo/ui/card";
  import { Progress } from "@repo/ui/progress";
  import { createMutation, createQuery } from "@tanstack/svelte-query";

  import { goto } from "$app/navigation";
  import AttendanceCheckInCheckoutCard from "$lib/components/cards/AttendanceCheckInCheckoutCard.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { data, params }: PageProps = $props();
  let coords = $state({ latitude: 0, longitude: 0, accuracy: 0 });

  const attendance = createQuery(() =>
    orpc.organizations.attendances.get.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );

  const checkIn = createMutation(() => orpc.organizations.attendances.checkIn.mutationOptions());
  const checkOut = createMutation(() => orpc.organizations.attendances.checkOut.mutationOptions());

  $effect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        ({ coords: c }) => {
          coords = {
            latitude: c.latitude,
            longitude: c.longitude,
            accuracy: c.accuracy,
          };
        },
        (e) => {
          // TODO handle this error
          console.error(e);
        }
      );
    } else {
    }
  });

  // const attendance = $state<{
  //   status: "not_checked_in" | "checked_in" | "checked_out";
  //   checkInTime: string | null;
  //   checkOutTime: string | null;
  // }>({Applica
  //   status: "not_checked_in",
  //   checkInTime: null,
  //   checkOutTime: null,
  // });

  // const handleAttendanceAction = () => {
  //   if (attendance.status === "not_checked_in") {
  //     attendance.status = "checked_in";
  //     attendance.checkInTime = formatTime(new Date().getTime() / 1000);
  //   } else if (attendance.status === "checked_in") {
  //     attendance.status = "checked_out";
  //     attendance.checkOutTime = formatTime(new Date().getTime() / 1000);
  //   } else {
  //     attendance.status = "not_checked_in";
  //     attendance.checkInTime = null;
  //     attendance.checkOutTime = null;
  //   }
  // };

  // const getTaskStatusBadgeClass = (status: "pending" | "in_progress" | "done") => {
  //   switch (status) {
  //     case "done":
  //       return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  //     case "in_progress":
  //       return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  //     case "pending":
  //       return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  //     default:
  //       return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  //   }
  // };

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

<div class="flex flex-1 flex-col gap-4 p-4 lg:w-1/2">
  <div>
    <p class="text-xl font-bold lg:text-3xl">Welcome back, {data.user.name}!</p>
    <p class="text-muted-foreground">
      {new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      })}
    </p>
  </div>

  {#if attendance.isLoading}{:else if attendance.isError}{:else}
    <AttendanceCheckInCheckoutCard
      attendance={attendance.data?.attendance ?? null}
      onCheckIn={() => {
        checkIn.mutate(
          { slug: params.slug, ...coords },
          { onSuccess: () => {}, onError: () => {} }
        );
      }}
      onCheckOut={() => {
        checkOut.mutate(
          { slug: params.slug, ...coords },
          { onSuccess: () => {}, onError: () => {} }
        );
      }}
    />
  {/if}

  <!-- <Card class="p-6"> -->
  <!--   <div class="text-center"> -->
  <!--     <h2 class="mb-4 text-xl font-semibold">Today's Attendance</h2> -->
  <!--     <p class="mb-4 text-lg text-gray-600 dark:text-gray-400"> -->
  <!--       {#if attendance.status === "not_checked_in"} -->
  <!--         Not checked in yet -->
  <!--       {:else if attendance.status === "checked_in"} -->
  <!--         Checked in at {attendance.checkInTime} -->
  <!--       {:else} -->
  <!--         Checked out at {attendance.checkOutTime} -->
  <!--       {/if} -->
  <!--     </p> -->
  <!--     <Button onclick={handleAttendanceAction} size="lg"> -->
  <!--       {#if attendance.status === "not_checked_in"} -->
  <!--         Check In -->
  <!--       {:else if attendance.status === "checked_in"} -->
  <!--         Check Out -->
  <!--       {:else} -->
  <!--         Check In Again -->
  <!--       {/if} -->
  <!--     </Button> -->
  <!--   </div> -->
  <!-- </Card> -->

  <!-- <Card class="p-6"> -->
  <!--   <div class="mb-4 flex items-center justify-between"> -->
  <!--     <h2 class="text-xl font-semibold">Today's Tasks</h2> -->
  <!--     <Button variant="link" onclick={() => goto(`/app/${currentSlug}/tasks`)}>View all</Button> -->
  <!--   </div> -->
  <!--   <div class="space-y-4"> -->
  <!--     {#each mockTasks as task} -->
  <!--       <div class="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800"> -->
  <!--         <div> -->
  <!--           <h3 class="font-medium">{task.title}</h3> -->
  <!--           <p class="text-sm text-gray-600 dark:text-gray-400"> -->
  <!--             Due {task.dueDate} by {task.assignedBy} -->
  <!--           </p> -->
  <!--         </div> -->
  <!--         <Badge class={getTaskStatusBadgeClass(task.status)}> -->
  <!--           {task.status === "in_progress" -->
  <!--             ? "In Progress" -->
  <!--             : task.status === "done" -->
  <!--               ? "Done" -->
  <!--               : "Pending"} -->
  <!--         </Badge> -->
  <!--       </div> -->
  <!--     {/each} -->
  <!--   </div> -->
  <!-- </Card> -->

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
      <Button variant="link" onclick={() => goto(`/app/${params.slug}/announcements`)}
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
</div>
