<script lang="ts">
  import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus";
  import { Button } from "@repo/ui/button";
  import { createInfiniteQuery } from "@tanstack/svelte-query";

  import LoadMoreBtn from "$lib/components/buttons/LoadMoreBtn.svelte";
  import CalendarCardGrid from "$lib/components/cards/CalendarCardGrid.svelte";
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import CalendarDialog from "$lib/components/dialogs/CalendarDialog.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";
  import { orpc } from "$lib/orpc_client";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();
  let isCreateDialogOpen = $state(false);

  const calendars = createInfiniteQuery(() =>
    orpc.calendars.list.infiniteOptions({
      enabled: !!params.slug,
      initialPageParam: 0,
      input: (cursor) => ({ pageSize: 20, cursor, slug: params.slug }),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const allCalendars = $derived(calendars.data?.pages.flatMap((page) => page.items) ?? []);

  const calendarsWithSlug = $derived(
    allCalendars.map((calendar) => ({
      ...calendar,
      slug: params.slug,
    }))
  );
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Calendars", href: `/dashboard/${params.slug}/calendars` },
  ]}
/>

<DashboardContainer>
  <div class="flex items-center justify-between">
    <div></div>
    <Button variant="outline" onclick={() => (isCreateDialogOpen = true)}>
      <CalendarPlusIcon size={16} class="mr-2" />
      Create Calendar
    </Button>
  </div>

  <CalendarCardGrid calendars={calendarsWithSlug} loading={calendars.isLoading} />

  {#if calendars.hasNextPage}
    <div class="flex items-center justify-center py-4">
      <LoadMoreBtn
        onclick={() => calendars.fetchNextPage()}
        loading={calendars.isFetchingNextPage}
        disabled={calendars.isFetchingNextPage}
      />
    </div>
  {/if}
</DashboardContainer>

<CalendarDialog bind:open={isCreateDialogOpen} slug={params.slug} />
