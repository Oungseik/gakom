<script lang="ts">
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { Debounced } from "runed";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import SkeletonStatsCard from "$lib/components/skeletons/SkeletonStatsCard.svelte";
  import AttendanceStatistics from "$lib/components/statistics/AttendanceStatistics.svelte";
  import { columns } from "$lib/components/tables/AttendanceTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { attendancesFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types.js";

  const { params }: PageProps = $props();

  const searchParams = useSearchParams(attendancesFilterSchema);
  const debounced = new Debounced(() => searchParams.search, 500);

  const attendances = createInfiniteQuery(() =>
    orpc.organizations.attendances.list.infiniteOptions({
      initialPageParam: 0,
      input: (cursor) => ({
        slug: params.slug,
        cursor,
        pageSize: 10,
        filter: {
          search: debounced.current || undefined,
          date: searchParams.date || undefined,
          status: searchParams.status?.length ? searchParams.status : undefined,
        },
      }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !!params.slug,
    })
  );

  const allAttendances = $derived(attendances.data?.pages.flatMap((page) => page.items) ?? []);

  const stats = createQuery(() =>
    orpc.organizations.attendances.stats.get.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );
</script>

<DashboardHeader breadcrumbItems={[{ desc: "Dashboard", href: `/dashboard/${params.slug}` }]} />

<DashboardContainer>
  <section class="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-5">
    {#if stats.isLoading}
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
      <SkeletonStatsCard />
    {:else if stats.data}
      <AttendanceStatistics data={stats.data} />
    {/if}
  </section>

  <section>
    <div class="my-4">
      <h1 class="text-muted-foreground">Attendances</h1>
    </div>

    <DataTable {columns} data={allAttendances} loading={attendances.isLoading} />

    {#if attendances.hasNextPage}
      <div class="flex items-center justify-center py-4">
        <LoadMoreBtn
          onclick={() => attendances.fetchNextPage()}
          loading={attendances.isFetchingNextPage}
          disabled={attendances.isFetchingNextPage}
        />
      </div>
    {/if}
  </section>
</DashboardContainer>
