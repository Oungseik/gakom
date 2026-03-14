<script lang="ts">
  import * as Sidebar from "@repo/ui/sidebar";
  import type { Component } from "svelte";

  import { page } from "$app/state";

  type Feature = {
    name: string;
    url: string;
    icon: Component;
  };

  let {
    features,
    title,
    separator = false,
  }: {
    features: Feature[];
    title?: string;
    separator?: boolean;
  } = $props();
</script>

{#if title}
  <Sidebar.GroupLabel
    class="text-muted-foreground/70 px-2 py-1.5 text-[11px] font-semibold tracking-wider uppercase"
  >
    {title}
  </Sidebar.GroupLabel>
{/if}

{#if separator}
  <Sidebar.Separator class="my-2" />
{/if}

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
  <Sidebar.Menu>
    {#each features as item (item.url)}
      <Sidebar.MenuItem>
        <Sidebar.MenuButton
          isActive={page.url.pathname === item.url}
          tooltipContent={item.name}
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
