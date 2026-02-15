<script lang="ts">
  import { buttonVariants } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { ScrollArea, Scrollbar } from "@repo/ui/scroll-area";
  import { createInfiniteQuery, createMutation, createQuery } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import AttendanceCheckInCheckOutSkeleton from "$lib/components/cards/AttendanceCheckInCheckOutSkeleton.svelte";
  import AttendanceCheckInCheckoutCard from "$lib/components/cards/AttendanceCheckInCheckoutCard.svelte";
  import LeaveUsageChart from "$lib/components/charts/LeaveUsageChart.svelte";
  import AttendanceCheckInCheckoutError from "$lib/components/errors/AttendanceCheckInCheckoutError.svelte";
  import { columns as leaveRequestsColumn } from "$lib/components/tables/LeaveRequestsTable/app_columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
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
      input: { slug: params.slug, pageSize: 5, filter: { from: new Date() } },
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
    </section>

    <section>
      <Card.Root>
        <Card.Header class="flex items-center justify-between">
          <Card.Title class="text-muted-foreground">Attendance history</Card.Title>

          <a href={`/app/${params.slug}/attendances`} class={buttonVariants({ variant: "link" })}
            >View details</a
          >
        </Card.Header>
        <Card.Content class="space-y-2">
          {#if attendances.isLoading}
            {#each Array(3) as _, i}
              <div class="animate-pulse py-3 {i === 0 ? 'pt-0' : ''}">
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
            {#each allAttendances.slice(0, 5) as attendance, i (attendance.id)}
              <div class="flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <p class="truncate">{attendance.date}</p>
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
        </Card.Content>
      </Card.Root>
    </section>

    <section>
      <Card.Root>
        <Card.Header class="flex items-center justify-between">
          <Card.Title class="text-muted-foreground">Leave Balance</Card.Title>
          <a href={`/app/${params.slug}/leave`} class={buttonVariants({ variant: "link" })}
            >View details</a
          >
        </Card.Header>
        <Card.Content class="space-y-4">
          <ScrollArea class="grid w-full grid-cols-1 overflow-auto">
            <div class="flex items-center justify-evenly gap-4">
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
          <DataTable
            columns={leaveRequestsColumn}
            border={false}
            data={leaveRequests.data?.items ?? []}
            loading={leaveRequests.isLoading}
          />
        </Card.Content>
      </Card.Root>
    </section>
  </div>
</div>
