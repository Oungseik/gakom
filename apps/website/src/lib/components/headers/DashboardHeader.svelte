<script lang="ts">
  import * as Breadcrumb from "@repo/ui/breadcrumb";
  import { Separator } from "@repo/ui/separator";
  import * as Sidebar from "@repo/ui/sidebar";
  import type { Snippet } from "svelte";

  type BreadcrumbItem = {
    href: string;
    desc: string;
  };

  type Props = { breadcrumbItems: BreadcrumbItem[]; actions?: Snippet };

  const { breadcrumbItems, actions }: Props = $props();
  const items = $derived(breadcrumbItems.slice(0, breadcrumbItems.length - 2));
  const page = $derived(breadcrumbItems.at(-1));

  console.log("hello");
</script>

<header
  class="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
>
  <div class="flex items-center gap-2 px-4">
    <Sidebar.Trigger class="-ms-1" />
    <Separator orientation="vertical" class="me-2 data-[orientation=vertical]:h-4" />
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {#each items as item (item.href)}
          <Breadcrumb.Item class="hidden md:block">
            <Breadcrumb.Link href={item.href}>{item.desc}</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator class="hidden md:block" />
        {/each}
        {#if page}
          <Breadcrumb.Item>
            <Breadcrumb.Page>{page.desc}</Breadcrumb.Page>
          </Breadcrumb.Item>
        {/if}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  </div>
  {#if actions}
    {@render actions()}
  {/if}
</header>
