<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
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

  const items = $derived([
    { name: "Home", icon: HouseIcon, url: `/app/${slug}` },
    { name: "Attendances", icon: ClockIcon, url: `/app/${slug}/attendances` },
    { name: "Leave", icon: CalendarIcon, url: `/app/${slug}/leave` },
    { name: "Profile", icon: UserIcon, url: `/app/${slug}/profile` },
  ]);
</script>

<Sidebar.Provider>
  <AppSidebar
    role={data.member?.role ?? "MEMBER"}
    user={data.user}
    organization={data.organization}
    {items}
  />
  <Sidebar.Inset>
    <div class="min-h-[calc(100dvh-70px)]">
      {@render children()}
    </div>
    <AppDock {items} currentPath={page.url.pathname} />
  </Sidebar.Inset>
</Sidebar.Provider>
