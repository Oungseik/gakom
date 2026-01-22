<script lang="ts">
  import { buttonVariants } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { Progress } from "@repo/ui/progress";
  import { createQuery } from "@tanstack/svelte-query";

  import { columns } from "$lib/components/tables/LeaveRequestsTable/app_columns";
  import DataTable from "$lib/components/tables/common/DataTable.svelte";
  import { orpc } from "$lib/orpc_client";

  type Props = {
    slug: string;
    balances: { totalDays: number; usedDays: number; name: string }[];
  };

  const props: Props = $props();

  const leaveRequests = createQuery(() =>
    orpc.organizations.leaveRequests.list.queryOptions({
      input: { slug: props.slug, pageSize: 5, filter: { from: new Date() } },
      enabled: !!props.slug,
    })
  );
</script>

<Card.Root>
  <Card.Header class="flex items-center justify-between">
    <Card.Title class="text-muted-foreground">Leave Balance</Card.Title>
    <a href={`/app/${props.slug}/attendances`} class={buttonVariants({ variant: "link" })}
      >View all</a
    >
  </Card.Header>
  <Card.Content class="space-y-4">
    <div class="grid grid-cols-3 gap-4">
      {#each props.balances as balance (balance.name)}
        <div>
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium">{balance.name}</span>
            <span class="text-muted-foreground text-sm">{balance.usedDays}/{balance.totalDays}</span
            >
          </div>
          <Progress value={balance.usedDays} max={balance.totalDays} />
        </div>
      {/each}
    </div>

    <DataTable
      {columns}
      border={false}
      data={leaveRequests.data?.items ?? []}
      loading={leaveRequests.isLoading}
    />
  </Card.Content>
</Card.Root>
