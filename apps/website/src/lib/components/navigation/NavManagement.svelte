<script lang="ts">
  import * as Sidebar from "@repo/ui/sidebar";
  import { createQuery } from "@tanstack/svelte-query";
  import type { Component } from "svelte";

  import { orpc } from "$lib/orpc_client";

  type Feature = {
    name: string;
    url: string;
    icon: Component;
  };

  let { features, slug }: { features: Feature[]; slug?: string } = $props();
  const count = createQuery(() =>
    orpc.organizations.attendancesPolicies.count.queryOptions({
      input: { slug: slug! },
      enabled: !!slug,
    })
  );
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>Managements</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each features as item (item.url)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton tooltipContent={item.name}>
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              <item.icon />
              <span>{item.name}</span>
              {#if item.name === "Attendances" && count?.data?.count === 0}
                <span class="inline-block size-1.5 animate-pulse rounded-full bg-green-300"
                  >new</span
                >
              {/if}
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
