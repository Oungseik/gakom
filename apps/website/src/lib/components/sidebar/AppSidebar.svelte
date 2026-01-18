<script lang="ts">
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import * as Avatar from "@repo/ui/avatar";
  import * as Sidebar from "@repo/ui/sidebar";
  import type { Component, ComponentProps } from "svelte";

  import NavMain from "$lib/components/navigation/NavMain.svelte";
  import NavSecondary from "$lib/components/navigation/NavSecondary.svelte";
  import { getNameIntials } from "$lib/utils";

  type User = {
    email: string;
    name: string;
    image?: string | null;
  };

  type Organization = {
    id: string;
    name: string;
    logo: string;
    slug: string;
    plan?: string;
  };

  type Item = { name: string; icon: Component; url: string };

  let {
    collapsible = "offcanvas",
    user,
    role,
    org,
    items,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: User;
    role: string;
    org: Organization;
    items: Item[];
  } = $props();

  const { firstWord, secondWord } = $derived(getNameIntials(user.name));
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <div
      class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex gap-2 p-2"
    >
      <img src={org.logo} class="aspect-square size-8 rounded-lg border" alt={org.name} />
      <div class="grid flex-1 text-start text-sm">
        <span class="truncate font-medium">
          {org.name}
        </span>
        <span class="truncate text-xs">{org.plan ?? "Free"}</span>
      </div>
    </div>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain features={items} />
    {#if role !== "member"}
      <NavSecondary
        class="mt-auto"
        items={[
          {
            url: `/dashboard/${org.slug}`,
            icon: LayoutDashboardIcon,
            title: "Admin Dashboard",
          },
        ]}
      />
    {/if}
  </Sidebar.Content>
  <Sidebar.Footer>
    <div class="flex h-12 items-center gap-2 px-2 py-1.5 text-start text-sm">
      <Avatar.Root class="size-8 rounded-lg">
        <Avatar.Image src={user.image} alt={user.name} />
        <Avatar.Fallback class="rounded-lg">{firstWord}{secondWord}</Avatar.Fallback>
      </Avatar.Root>
      <div class="grid flex-1 text-start text-sm leading-tight">
        <span class="truncate font-medium">{user.name}</span>
        <span class="truncate text-xs">{user.email}</span>
      </div>
    </div>
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
