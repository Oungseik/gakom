<script lang="ts">
  import * as Breadcrumb from "@repo/ui/breadcrumb";
  import { Separator } from "@repo/ui/separator";
  import * as Sidebar from "@repo/ui/sidebar";

  import AppSidebar from "$lib/components/sidebar/AppSidebar.svelte";
  import { breadcrumb } from "$lib/store/breadcrumb.svelte";

  import { type LayoutProps } from "./$types";

  const { data, children }: LayoutProps = $props();

  const items = $derived(breadcrumb.value.slice(0, breadcrumb.value.length - 1));
  const page = $derived(breadcrumb.value.at(-1));
</script>

<Sidebar.Provider>
  <AppSidebar
    user={data.user}
    orgs={data.organizations}
    activeOrganizationId={data.session.activeOrganizationId}
  />
  <Sidebar.Inset>
    <header
      class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
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
    </header>
    <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
