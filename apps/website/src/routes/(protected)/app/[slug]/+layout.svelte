<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClipboardListIcon from "@lucide/svelte/icons/clipboard-list";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import HouseIcon from "@lucide/svelte/icons/house";
  import UserIcon from "@lucide/svelte/icons/user";
  import * as Sidebar from "@repo/ui/sidebar";

  import { page } from "$app/state";
  import AppDock from "$lib/components/dock/AppDock.svelte";
  import AppSidebar from "$lib/components/sidebar/AppSidebar.svelte";

  import type { LayoutProps } from "./$types";

  const { data, params, children }: LayoutProps = $props();

  const slug = $derived(params.slug);
  const org = $derived(
    data.organizations.find((o) => o.slug === slug) ?? data.organizations.at(0)!
  );

  const items = $derived([
    { name: "Home", icon: HouseIcon, url: `/app/${slug}` },
    { name: "Attendances", icon: ClockIcon, url: `/app/${slug}/attendances` },
    { name: "Tasks", icon: ClipboardListIcon, url: `/app/${slug}/tasks` },
    { name: "Leave", icon: CalendarIcon, url: `/app/${slug}/leave` },
    { name: "Profile", icon: UserIcon, url: `/app/${slug}/profile` },
  ]);
</script>

<Sidebar.Provider>
  <AppSidebar role={data.member.role} user={data.user} {org} {items} />
  <Sidebar.Inset>
    {@render children()}
    <AppDock {items} currentPath={page.url.pathname} />
  </Sidebar.Inset>
</Sidebar.Provider>
