<script lang="ts">
  import * as Sidebar from "@repo/ui/sidebar";
  import type { Component } from "svelte";
  import type { ComponentProps } from "svelte";

  let {
    items,
    ...restProps
  }: {
    items: { title: string; url: string; icon: Component; fullReload?: boolean }[];
  } & ComponentProps<typeof Sidebar.Group> = $props();
</script>

<Sidebar.Group {...restProps}>
  <Sidebar.GroupContent>
    <Sidebar.Menu>
      {#each items as item (item.title)}
        <Sidebar.MenuItem>
          <Sidebar.MenuButton>
            {#snippet child({ props })}
              {#if item.fullReload}
                <a href={item.url} {...props} data-sveltekit-reload>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              {:else}
                <a href={item.url} {...props}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              {/if}
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
</Sidebar.Group>
