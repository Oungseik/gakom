<script lang="ts">
  import { buttonVariants } from "@repo/ui/button";
  import { ScrollArea, Scrollbar } from "@repo/ui/scroll-area";
  import { createInfiniteQuery, createMutation, createQuery } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import AttendanceCheckInCheckOutSkeleton from "$lib/components/cards/AttendanceCheckInCheckOutSkeleton.svelte";
  import AttendanceCheckInCheckoutCard from "$lib/components/cards/AttendanceCheckInCheckoutCard.svelte";
  import LeaveUsageChart from "$lib/components/charts/LeaveUsageChart.svelte";
  import AttendanceCheckInCheckoutError from "$lib/components/errors/AttendanceCheckInCheckoutError.svelte";
  import { orpc } from "$lib/orpc_client";
  import { getAttendanceStatusBadgeClass, getTimeInTimezone } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { data, params }: PageProps = $props();
  let coords = $state({ latitude: 0, longitude: 0, accuracy: 0 });

  const attendance = createQuery(() =>
    orpc.attendances.get.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );

  const attendances = createInfiniteQuery(() =>
    orpc.attendances.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        slug: params.slug,
        cursor,
        pageSize: 5,
        filter: { self: true },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );
  const allAttendances = $derived(attendances.data?.pages.flatMap((page) => page.items) ?? []);

  const leaveBalances = createQuery(() =>
    orpc.leaveBalances.list.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );

  const leaveRequests = createQuery(() =>
    orpc.leaveRequests.list.queryOptions({
      input: { slug: params.slug, pageSize: 5, filter: { from: new Date(), self: true } },
      enabled: !!params.slug,
    })
  );

  const checkIn = createMutation(() => orpc.attendances.checkIn.mutationOptions());
  const checkOut = createMutation(() => orpc.attendances.checkOut.mutationOptions());

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
</script>

<div class="flex flex-1 flex-col gap-6 p-4">
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

  {#if attendance.isError}
    <AttendanceCheckInCheckoutError message={attendance.error.message} />
  {:else if attendance.isLoading}
    <AttendanceCheckInCheckOutSkeleton />
  {:else}
    <AttendanceCheckInCheckoutCard
      attendance={attendance.data?.attendance ?? null}
      policy={{
        timezone: data.member?.attendancePolicy?.timezone!,
        clockInSec: data.member?.attendancePolicy?.clockInSec!,
        clockOutSec: data.member?.attendancePolicy?.clockOutSec!,
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

  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold">Attendance History</h2>
      <a
        href={`/app/${params.slug}/attendances`}
        class={buttonVariants({ variant: "link", size: "sm" })}>View all</a
      >
    </div>
    <div class="bg-card rounded-lg border">
      {#if attendances.isLoading}
        {#each Array(3) as _, i}
          <div class="animate-pulse border-b p-4 {i === 0 ? '' : ''}">
            <div class="flex items-center justify-between gap-4">
              <div class="flex-1">
                <div class="bg-muted mb-1.5 h-4 w-24 rounded"></div>
                <div class="bg-muted h-3 w-32 rounded"></div>
              </div>
              <div class="bg-muted h-5 w-16 rounded-full"></div>
            </div>
          </div>
        {/each}
      {:else if allAttendances.length === 0}
        <div class="py-8 text-center">
          <p class="text-muted-foreground">No recent attendance records</p>
        </div>
      {:else}
        {#each allAttendances.slice(0, 5) as attendance (attendance.id)}
          <div class="flex items-center justify-between border-b p-4 last:border-b-0">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{attendance.date}</p>
              <p class="text-muted-foreground truncate text-sm">
                {attendance.checkInAt
                  ? getTimeInTimezone(attendance.policy.timezone, attendance.checkInAt, {
                      hour12: true,
                    })
                  : "-"}
                -
                {attendance.checkOutAt
                  ? getTimeInTimezone(attendance.policy.timezone, attendance.checkOutAt, {
                      hour12: true,
                    })
                  : "-"}
              </p>
            </div>
            <span
              class="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium {getAttendanceStatusBadgeClass(
                attendance.status
              )}"
            >
              {attendance.status.replace("_", " ")}
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </section>

  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-lg font-semibold">Leave Balance</h2>
      <a href={`/app/${params.slug}/leave`} class={buttonVariants({ variant: "link", size: "sm" })}
        >View all</a
      >
    </div>
    <div class="bg-card rounded-lg border p-4">
      <ScrollArea class="w-full overflow-auto">
        <div class="flex items-center justify-start gap-4">
          {#each leaveBalances.data?.items as balance (balance.name)}
            <LeaveUsageChart
              maxValue={balance.totalDays}
              value={balance.usedDays}
              label={balance.name}
              key={balance.name}
              color="var(--color-primary)"
            />
          {/each}
        </div>
        <Scrollbar orientation="horizontal" />
      </ScrollArea>
    </div>
  </section>

  {#if leaveRequests.data && leaveRequests.data.items.length > 0}
    <section>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Recent Leave Requests</h2>
      </div>
      <div class="bg-card rounded-lg border">
        {#each leaveRequests.data.items.slice(0, 3) as request (request.id)}
          <div class="flex items-center justify-between border-b p-4 last:border-b-0">
            <div class="min-w-0 flex-1">
              <p class="font-medium">{request.name}</p>
              <p class="text-muted-foreground truncate text-sm">
                {new Date(request.startDate).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                })}
                -
                {new Date(request.endDate).toLocaleDateString("en-CA", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span
              class="inline-flex flex-shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium {request.status ===
              'APPROVED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : request.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}"
            >
              {request.status}
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>
