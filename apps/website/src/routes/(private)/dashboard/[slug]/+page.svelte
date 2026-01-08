<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import LogInIcon from "@lucide/svelte/icons/log-in";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import UsersIcon from "@lucide/svelte/icons/users";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { Spinner } from "@repo/ui/spinner";
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";

  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import DataTable from "$lib/components/tables/AttendanceTable/DataTable.svelte";
  import { columns } from "$lib/components/tables/AttendanceTable/columns";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types.js";

  const { params }: PageProps = $props();

  const attendances = createInfiniteQuery(() =>
    orpc.organizations.attendances.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 10, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allAttendances = $derived(
    attendances.data?.pages.flatMap((page) => page.items) ?? []
  );

  const stats = createQuery(() =>
    orpc.organizations.attendances.stats.get.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );
</script>

<DashboardHeader breadcrumbItems={[{ desc: "Dashboard", href: `/dashboard/${params.slug}` }]} />

<DashboardContainer>
  {#if attendances.isLoading || stats.isLoading}
    <div class="flex h-40 w-full items-center justify-center">
      <Spinner class="size-10" />
    </div>
  {:else}
    {#if stats.data}
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-4">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Total Present</p>
              <p class="text-2xl font-bold">{stats.data.totalPresent}</p>
            </div>
            <LogInIcon class="size-6 text-blue-500" />
          </Card.Content>
        </Card.Card>

        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-4">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Late Arrivals Today</p>
              <p class="text-2xl font-bold">{stats.data.lateArrivals}</p>
            </div>
            <ClockIcon class="size-6 text-red-500" />
          </Card.Content>
        </Card.Card>

        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-4">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Early Departures Today</p>
              <p class="text-2xl font-bold">{stats.data.earlyDepartures}</p>
            </div>
            <LogOutIcon class="size-6 text-orange-500" />
          </Card.Content>
        </Card.Card>

        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-4">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Members Present Today</p>
              <p class="text-2xl font-bold">{stats.data.membersPresent}</p>
            </div>
            <UsersIcon class="size-6 text-emerald-500" />
          </Card.Content>
        </Card.Card>

        <Card.Card>
          <Card.Content class="flex items-center justify-between pt-4">
            <div>
              <p class="text-muted-foreground mb-1 text-sm">Pending Check-outs</p>
              <p class="text-2xl font-bold">{stats.data.pendingCheckouts}</p>
            </div>
            <CalendarIcon class="size-6 text-amber-500" />
          </Card.Content>
        </Card.Card>
      </div>
    {/if}

    {#if allAttendances.length > 0}
      <DataTable {columns} data={allAttendances} />
    {:else}
      <DataTable {columns} data={[]} />
    {/if}
  {/if}

  {#if attendances.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <Button
        variant="outline"
        onclick={() => attendances.fetchNextPage()}
        disabled={attendances.isFetchingNextPage}
      >
        {#if attendances.isFetchingNextPage}
          <Spinner class="mr-2 size-4" />
          Loading...
        {:else}
          Load More
        {/if}
      </Button>
    </div>
  {/if}
</DashboardContainer>
