<script lang="ts">
  import { CalendarDate } from "@internationalized/date";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import XIcon from "@lucide/svelte/icons/x";
  import { Button, buttonVariants } from "@repo/ui/button";
  import { ConfirmDeleteDialog, confirmDelete } from "@repo/ui/confirm-delete-dialog";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Popover from "@repo/ui/popover";
  import { RangeCalendar } from "@repo/ui/range-calendar";
  import { ScrollArea, Scrollbar } from "@repo/ui/scroll-area";
  import * as Select from "@repo/ui/select";
  import { createInfiniteQuery, createMutation, createQuery } from "@tanstack/svelte-query";
  import { useSearchParams } from "runed/kit";
  import { toast } from "svelte-sonner";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import EventCalendar from "$lib/components/calendars/EventCalendar.svelte";
  import LeaveUsageChart from "$lib/components/charts/LeaveUsageChart.svelte";
  import { orpc } from "$lib/orpc_client";
  import { leaveRequestsFilterSchema } from "$lib/searchParams";
  import { formatDate } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();

  const searchParams = useSearchParams(leaveRequestsFilterSchema);

  const balances = createQuery(() =>
    orpc.leaveBalances.list.queryOptions({
      input: { slug: params.slug, pageSize: 50 },
      enabled: !!params.slug,
    })
  );

  const leaveRequests = createInfiniteQuery(() =>
    orpc.leaveRequests.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        slug: params.slug,
        cursor,
        pageSize: 10,
        filter: {
          status: searchParams.status.length > 0 ? searchParams.status : undefined,
          dateFrom: searchParams.dateFrom ? new Date(searchParams.dateFrom) : undefined,
          dateTo: searchParams.dateTo ? new Date(searchParams.dateTo) : undefined,
          self: true,
        },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allRequests = $derived(leaveRequests.data?.pages.flatMap((p) => p.items) ?? []);

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const attendances = createQuery(() =>
    orpc.attendances.list.queryOptions({
      input: {
        slug: params.slug,
        pageSize: 100,
        filter: {
          self: true,
          dateFrom: startOfMonth.toISOString().split("T")[0],
          dateTo: endOfMonth.toISOString().split("T")[0],
        },
      },
      enabled: !!params.slug,
    })
  );

  const calendarEvents = createQuery(() =>
    orpc.calendarEvents.list.queryOptions({
      input: {
        slug: params.slug,
        pageSize: 100,
        filter: {
          from: startOfMonth.toISOString().split("T")[0],
          to: endOfMonth.toISOString().split("T")[0],
        },
      },
      enabled: !!params.slug,
    })
  );

  const attendancesData = $derived(
    attendances.data?.items.map((item) => ({
      date: item.date,
      checkInAt: item.checkInAt,
      checkOutAt: item.checkOutAt,
    })) ?? []
  );

  // TODO: Remove mock data when API properly returns user's calendar events
  // Currently returns empty if user has no assigned calendar (MEMBER role)
  const MOCK_EVENTS: Date[] = [];

  const eventsData = $derived(
    calendarEvents.data?.items.length
      ? calendarEvents.data.items.map((item) => new Date(item.date))
      : MOCK_EVENTS
  );

  const createRequest = createMutation(() => orpc.leaveRequests.create.mutationOptions());
  const cancelRequest = createMutation(() => orpc.leaveRequests.cancel.mutationOptions());

  let showRequestDialog = $state(false);
  let selectedLeaveId = $state("");
  let dateRange = $state<{ start: CalendarDate | null; end: CalendarDate | null }>({
    start: null,
    end: null,
  });
  let reason = $state("");

  function handleCreateRequest() {
    if (!selectedLeaveId || !dateRange.start) {
      toast.error("Please fill in all required fields");
      return;
    }

    const startDate = new Date(
      dateRange.start.year,
      dateRange.start.month - 1,
      dateRange.start.day
    );
    const endDate = dateRange.end
      ? new Date(dateRange.end.year, dateRange.end.month - 1, dateRange.end.day)
      : startDate;

    createRequest.mutate(
      {
        slug: params.slug,
        leaveId: selectedLeaveId,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Leave request submitted successfully");
          showRequestDialog = false;
          selectedLeaveId = "";
          dateRange = { start: null, end: null };
          reason = "";
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create request");
        },
      }
    );
  }

  function handleCancelRequest(id: string) {
    cancelRequest.mutate(
      { slug: params.slug, id },
      {
        onSuccess: () => {
          toast.success("Leave request cancelled");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to cancel request");
        },
      }
    );
  }

  function setStatusFilter(status: string) {
    if (status === "all") {
      searchParams.update({ status: [] });
    } else {
      searchParams.update({
        status: [status as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"],
      });
    }
  }

  const currentStatus = $derived(searchParams.status.length === 0 ? "all" : searchParams.status[0]);

  function canCancel(request: { status: string; endDate: Date }) {
    if (request.status !== "PENDING" && request.status !== "APPROVED") return false;
    return new Date(request.endDate).getTime() > Date.now();
  }

  function handleCancelWithConfirm(id: string) {
    confirmDelete({
      title: "Cancel leave request",
      description: "Are you sure you want to cancel this leave request?",
      onConfirm: async () => {
        handleCancelRequest(id);
      },
    });
  }

  function formatDateStr(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<Dialog.Root bind:open={showRequestDialog}>
  <ConfirmDeleteDialog />
  <div class="space-y-6 p-4 md:p-6 lg:w-2/3 lg:p-8 xl:w-1/2">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Leave Management</h1>
        <p class="text-muted-foreground">View your leave balances and history</p>
      </div>
    </div>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Work Calendar</h2>
      </div>
      <EventCalendar attendances={attendancesData} events={eventsData} />
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Leave Balances</h2>
      </div>
      {#if balances.isLoading}
        <div class="bg-card animate-pulse rounded-lg border p-4">
          <div class="flex items-center justify-start gap-4">
            {#each Array(3) as _}
              <div class="h-36 w-36 shrink-0">
                <div class="bg-muted mx-auto aspect-square max-h-[80px] w-20 rounded-full"></div>
                <div class="mt-2 text-center">
                  <div class="bg-muted mx-auto h-4 w-24 rounded"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {:else if balances.data?.items.length === 0}
        <div class="py-8 text-center">
          <p class="text-muted-foreground">No leave balances found</p>
        </div>
      {:else}
        <div class="bg-card rounded-lg border p-4">
          <ScrollArea class="w-full overflow-auto">
            <div class="flex items-center justify-start gap-4">
              {#each balances.data?.items ?? [] as balance (balance.id)}
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
      {/if}

      <Dialog.Trigger
        class={buttonVariants({ variant: "default", class: "w-full" })}
        onclick={() => (showRequestDialog = true)}
      >
        <CalendarIcon class="mr-2 size-4" />
        Request Leave
      </Dialog.Trigger>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold">Leave History</h2>
        <Select.Root
          type="single"
          value={currentStatus}
          onValueChange={(value) => setStatusFilter(value)}
        >
          <Select.Trigger class="w-32">
            {currentStatus === "all"
              ? "All"
              : currentStatus === "PENDING"
                ? "Pending"
                : currentStatus === "APPROVED"
                  ? "Approved"
                  : currentStatus === "REJECTED"
                    ? "Rejected"
                    : currentStatus === "CANCELLED"
                      ? "Cancelled"
                      : "Status"}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">All</Select.Item>
            <Select.Item value="PENDING">Pending</Select.Item>
            <Select.Item value="APPROVED">Approved</Select.Item>
            <Select.Item value="REJECTED">Rejected</Select.Item>
            <Select.Item value="CANCELLED">Cancelled</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>

      <div class="space-y-2">
        {#if leaveRequests.isLoading}
          {#each Array(5) as _}
            <div class="bg-card animate-pulse rounded-lg border p-4">
              <div class="flex items-center justify-between gap-4">
                <div class="flex-1">
                  <div class="bg-muted mb-2 h-4 w-32 rounded"></div>
                  <div class="bg-muted h-3 w-48 rounded"></div>
                </div>
                <div class="bg-muted h-6 w-20 rounded-full"></div>
              </div>
            </div>
          {/each}
        {:else if allRequests.length === 0}
          <div class="py-8 text-center">
            <p class="text-muted-foreground">No leave requests found</p>
          </div>
        {:else}
          {#each allRequests as request (request.id)}
            <div class="bg-card flex items-start justify-between rounded-lg border p-4">
              <div class="min-w-0 flex-1">
                <div class="mb-1">
                  <p class="truncate font-medium">{request.name}</p>
                </div>
                <div class="text-muted-foreground flex items-center gap-2 text-sm">
                  <ClockIcon class="size-3.5" />
                  <span>
                    {formatDateStr(request.startDate)} - {formatDateStr(request.endDate)}
                  </span>
                </div>
                {#if request.reason}
                  <p class="text-muted-foreground mt-1 truncate text-sm">{request.reason}</p>
                {/if}
              </div>
              <div class="flex flex-col items-end gap-2">
                <span
                  class="rounded-full px-2 py-0.5 text-xs {request.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'}"
                >
                  {request.status}
                </span>
                {#if canCancel({ status: request.status, endDate: request.endDate })}
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => handleCancelWithConfirm(request.id)}
                    disabled={cancelRequest.isPending}
                  >
                    <XIcon class="size-4" />
                  </Button>
                {/if}
              </div>
            </div>
          {/each}
        {/if}

        {#if leaveRequests.hasNextPage}
          <div class="flex items-center justify-center py-4">
            <LoadMoreBtn
              onclick={() => leaveRequests.fetchNextPage()}
              loading={leaveRequests.isFetchingNextPage}
              disabled={leaveRequests.isFetchingNextPage}
            />
          </div>
        {/if}
      </div>
    </section>
  </div>

  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Request Leave</Dialog.Title>
      <Dialog.Description>Submit a new leave request</Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Label>Leave Type</Label>
        <Select.Root
          type="single"
          value={selectedLeaveId}
          onValueChange={(value) => {
            selectedLeaveId = value;
          }}
        >
          <Select.Trigger class="w-full">
            {#if selectedLeaveId}
              {@const leave = balances.data?.items.find((b) => b.leaveId === selectedLeaveId)}
              {leave?.name ?? "Select leave type"}
            {:else}
              Select leave type
            {/if}
          </Select.Trigger>
          <Select.Content>
            {#each balances.data?.items ?? [] as b (b.leaveId)}
              <Select.Item value={b.leaveId}>{b.name}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <div class="grid gap-2">
        <Label>Date Range</Label>
        <Popover.Root>
          <Popover.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline" class="w-full justify-between font-normal">
                {#if dateRange.start}
                  {formatDate(dateRange.start.toDate("UTC"))}
                  {dateRange.end ? `- ${formatDate(dateRange.end.toDate("UTC"))}` : ""}
                {:else}
                  <span class="text-muted-foreground">Select date range</span>
                {/if}
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-auto overflow-hidden p-0" align="start">
            {#key dateRange}
              <RangeCalendar
                value={dateRange.start && dateRange.end
                  ? { start: dateRange.start, end: dateRange.end }
                  : dateRange.start
                    ? { start: dateRange.start, end: null as unknown as CalendarDate }
                    : undefined}
                onValueChange={(value) => {
                  if (value?.start && value?.end) {
                    dateRange = {
                      start: value.start as CalendarDate,
                      end: value.end as CalendarDate,
                    };
                  } else if (value?.start && !value?.end) {
                    dateRange = {
                      start: value.start as CalendarDate,
                      end: null as unknown as CalendarDate,
                    };
                  } else {
                    dateRange = { start: null, end: null };
                  }
                }}
                captionLayout="dropdown"
              />
            {/key}
          </Popover.Content>
        </Popover.Root>
      </div>
      <div class="grid gap-2">
        <Label for="reason">Reason (optional)</Label>
        <Input id="reason" bind:value={reason} placeholder="Enter reason for leave" />
      </div>
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (showRequestDialog = false)}>Cancel</Button>
      <Button onclick={handleCreateRequest} disabled={createRequest.isPending}>
        {createRequest.isPending ? "Submitting..." : "Submit Request"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
