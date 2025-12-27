<script lang="ts">
  import * as Sidebar from "@repo/ui/sidebar";
  import type { Component } from "svelte";

  import { page } from "$app/state";

  type Feature = {
    name: string;
    url: string;
    icon: Component;
  };

  let { features }: { features: Feature[] } = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.Menu>
    {#each features as item (item.url)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          tooltipContent={item.name}
          class={{
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear":
              page.url.pathname === item.url,
          }}
        >
          {#snippet child({ props })}
            <a href={item.url} {...props}>
              <item.icon />
              <span>{item.name}</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
