<script lang="ts">
  import { buttonVariants } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { createInfiniteQuery, createMutation, createQuery } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import AttendanceCheckInCheckOutSkeleton from "$lib/components/cards/AttendanceCheckInCheckOutSkeleton.svelte";
  import AttendanceCheckInCheckoutCard from "$lib/components/cards/AttendanceCheckInCheckoutCard.svelte";
  import LeaveCard from "$lib/components/cards/LeaveCard.svelte";
  import { columns } from "$lib/components/tables/AttendanceTable/app_columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { data, params }: PageProps = $props();
  let coords = $state({ latitude: 0, longitude: 0, accuracy: 0 });
  const histCount = 7;

  const attendance = createQuery(() =>
    orpc.organizations.attendances.get.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );

  const attendances = createInfiniteQuery(() =>
    orpc.organizations.attendances.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        slug: params.slug,
        cursor,
        pageSize: 7,
        filter: { self: true },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );
  const allAttendances = $derived(attendances.data?.pages.flatMap((page) => page.items) ?? []);

  const leaveBalances = createQuery(() =>
    orpc.organizations.leaveBalances.list.queryOptions({
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
        () => {
          toast.error("Please enable location in order to check in, check out the attendance", {
            duration: Infinity,
          });
        }
      );
    } else {
      toast.warning("Please use browser which can support location access");
    }
  });

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
  //
  // const mockLeave = $state({ pendingRequests: 2, balance: "12 days used of 28", progress: 0.43 });

  // const mockAnnouncements = $state([
  //   {
  //     id: "1",
  //     title: "Company Holiday Schedule 2025",
  //     content: "Holiday list released for 2025. Check HR portal for details.",
  //     date: "2025-01-15",
  //     author: "HR Dept",
  //     priority: "high",
  //   },
  //   {
  //     id: "2",
  //     title: "New Team Building Activity",
  //     content: "We will have a team building event this month at the central office.",
  //     date: "2025-01-16",
  //     author: "Management",
  //     priority: "normal",
  //   },
  // ]);
</script>

<div class="flex flex-1 flex-col gap-8 p-4">
  <div>
    <p class="text-xl font-bold lg:text-3xl">Welcome back, {data.user.name}!</p>
    <p class="text-muted-foreground">
      {new Date().toLocaleString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
        weekday: "long",
      })}
    </p>
  </div>

  <div class="gap-8 space-y-8 lg:w-1/2">
    <section>
      {#if attendance.isLoading}
        <AttendanceCheckInCheckOutSkeleton />
      {:else}
        <AttendanceCheckInCheckoutCard
          attendance={attendance.data?.attendance ?? null}
          policy={{
            timezone: data.member.attendancePolicy?.timezone!,
            clockInSec: data.member.attendancePolicy?.clockInSec!,
            clockOutSec: data.member.attendancePolicy?.clockOutSec!,
          }}
          onCheckIn={() => {
            checkIn.mutate(
              { slug: params.slug, ...coords },
              {
                onSuccess: () => {
                  attendance.refetch();
                  attendances.refetch();
                },
                onError: () => {},
              }
            );
          }}
          onCheckOut={() => {
            checkOut.mutate(
              { slug: params.slug, ...coords },
              {
                onSuccess: () => {
                  attendance.refetch();
                  attendances.refetch();
                },
                onError: () => {},
              }
            );
          }}
        />
      {/if}
    </section>

    <section>
      <Card.Root>
        <Card.Header class="flex items-center justify-between">
          <Card.Title class="text-muted-foreground">
            Attendance history of last {histCount} days
          </Card.Title>

          <a href={`/app/${params.slug}/attendances`} class={buttonVariants({ variant: "link" })}
            >View all</a
          >
        </Card.Header>
        <Card.Content>
          <DataTable
            {columns}
            border={false}
            data={allAttendances}
            loading={attendances.isLoading}
          />
        </Card.Content>
      </Card.Root>
    </section>

    <section>
      {#if leaveBalances.data}
        <LeaveCard slug={params.slug} balances={leaveBalances.data.balances} />
      {/if}
    </section>
  </div>
</div>
