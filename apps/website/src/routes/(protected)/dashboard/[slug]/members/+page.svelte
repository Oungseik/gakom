<script lang="ts">
  import { createInfiniteQuery, createQuery } from "@tanstack/svelte-query";
  import { useSearchParams } from "runed/kit";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import MemberStatisticsCard from "$lib/components/cards/MemberStatisticsCard.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import Search from "$lib/components/inputs/Search.svelte";
  import { columns } from "$lib/components/tables/MembersTable/columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";
  import { membersFilterSchema } from "$lib/searchParams";

  import type { PageProps } from "./$types";

  const { params, data }: PageProps = $props();

  const membersFilterParams = useSearchParams(membersFilterSchema);

  const members = createInfiniteQuery(() =>
    orpc.members.list.infiniteOptions({
      enabled: !!params.slug,
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 20, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allMembers = $derived(members.data?.pages.flatMap((page) => page.items) ?? []);

  const stats = createQuery(() =>
    orpc.members.stats.queryOptions({ input: { slug: params.slug } })
  );

  const thisMonthTrend = $derived(
    stats.data?.lastMonthJoins
      ? Math.round(
          ((stats.data.thisMonthJoins - stats.data.lastMonthJoins) / stats.data.lastMonthJoins) *
            100
        )
      : undefined
  );
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Members", href: `/dashboard/${params.slug}/members` },
  ]}
/>

<DashboardContainer>
  {#if stats.isPending}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {#each Array(5) as _}
        <div class="bg-muted h-32 animate-pulse rounded-lg"></div>
      {/each}
    </div>
  {:else if stats.data}
    {@const data = stats.data}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <MemberStatisticsCard title="Total Members" value={data.totalMembers} icon="users" />
      <MemberStatisticsCard
        title="New This Month"
        value={data.thisMonthJoins}
        icon="user-plus"
        trend={thisMonthTrend}
      />
      <MemberStatisticsCard
        title="Joined Last Month"
        value={data.lastMonthJoins}
        icon="user-plus"
      />
      <MemberStatisticsCard title="Active Members" value={data.activeMembers} icon="users" />
      <MemberStatisticsCard title="Deactivated" value={data.deactivatedMembers} icon="user-minus" />
    </div>
  {/if}

  <section class="mt-4 space-y-2">
    <div class="flex flex-wrap gap-2">
      <Search bind:value={membersFilterParams.search} />
    </div>

    <DataTable
      {columns}
      data={allMembers.map((m) => ({
        ...m,
        memberId: m.id,
        organizationId: data.organization.id,
        slug: params.slug,
      }))}
      loading={members.isLoading}
    />

    {#if members.hasNextPage}
      <div class="flex items-center justify-center py-4">
        <LoadMoreBtn
          onclick={() => members.fetchNextPage()}
          loading={members.isFetchingNextPage}
          disabled={members.isFetchingNextPage}
        />
      </div>
    {/if}
  </section>
</DashboardContainer>
