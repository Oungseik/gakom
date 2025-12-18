<script lang="ts">
  import EllipsisIcon from "@lucide/svelte/icons/ellipsis";
  import * as Sidebar from "@repo/ui/sidebar";
  import type { Component } from "svelte";

  type Feature = {
    name: string;
    url: string;
    icon: Component;
  };

  let { features }: { features: Feature[] } = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.GroupLabel>Organization</Sidebar.GroupLabel>
  <Sidebar.Menu>
    {#each features as item (item.url)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              <item.icon />
              <span>{item.name}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
    <Sidebar.MenuItem>
      <Sidebar.MenuButton class="text-sidebar-foreground/70">
        <EllipsisIcon class="text-sidebar-foreground/70" />
        <span>More</span>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  </Sidebar.Menu>
</Sidebar.Group>
