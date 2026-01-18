<script lang="ts">
  import { buttonVariants } from "@repo/ui/button";
  import type { Component } from "svelte";

  type Props = {
    currentPath: string;
    items: { name: string; icon: Component; url: string }[];
  };

  const props: Props = $props();
</script>

<div class="bg-card sticky right-0 bottom-0 left-0 border-t shadow-lg lg:hidden">
  <div class="flex items-center justify-between gap-2 px-4 py-2">
    {#each props.items as item (item.url)}
      <div class="flex flex-1 shrink-0 flex-col text-center">
        <a
          href={item.url}
          class={props.currentPath === item.url
            ? buttonVariants({ variant: "secondary" })
            : buttonVariants({ variant: "ghost" })}
        >
          <item.icon class="size-4" />
        </a>
        <span class="text-xs">{item.name}</span>
      </div>
    {/each}
  </div>
</div>
