<script lang="ts">
  import AppWindowIcon from "@lucide/svelte/icons/app-window";
  import CalendarDaysIcon from "@lucide/svelte/icons/calendar-days";
  import ClipboardClockIcon from "@lucide/svelte/icons/clipboard-clock";
  import ClipboardListIcon from "@lucide/svelte/icons/clipboard-list";
  import FileChartColumnIncreasingIcon from "@lucide/svelte/icons/file-chart-column-increasing";
  import LayoutDashboardIcon from "@lucide/svelte/icons/layout-dashboard";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import TicketsPlaneIcon from "@lucide/svelte/icons/tickets-plane";
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import UserSearchIcon from "@lucide/svelte/icons/user-search";
  import UsersIcon from "@lucide/svelte/icons/users";
  import * as Sidebar from "@repo/ui/sidebar";
  import type { ComponentProps } from "svelte";

  import NavMain from "$lib/components/navigation/NavMain.svelte";
  import NavSecondary from "$lib/components/navigation/NavSecondary.svelte";
  import NavUser from "$lib/components/navigation/NavUser.svelte";
  import OrganizationSwitcher from "$lib/components/switchers/OrganizationSwitcher.svelte";

  import AddOrganizationForm from "../forms/AddOrganizationForm.svelte";

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

  let {
    collapsible = "offcanvas",
    user,
    orgs,
    slug,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: User;
    orgs: Organization[];
    slug?: string | null;
  } = $props();

  const organization = $derived(orgs.find((o) => o.slug === slug) ?? orgs.at(0)!);
  let open = $state(false);

  const data = $derived([
    {
      name: "Dashboard",
      url: `/dashboard/${organization.slug}`,
      icon: LayoutDashboardIcon,
    },
    {
      name: "Leave",
      url: `/dashboard/${organization.slug}/leave`,
      icon: TicketsPlaneIcon,
    },
    {
      name: "Members",
      url: `/dashboard/${organization.slug}/members`,
      icon: UsersIcon,
    },
    {
      name: "Invitations",
      url: `/dashboard/${organization.slug}/invitations`,
      icon: UserPlusIcon,
    },
    {
      name: "Attendance Policies",
      url: `/dashboard/${organization.slug}/attendances/policies`,
      icon: ClipboardClockIcon,
    },
    {
      name: "Leave Policies",
      url: `/dashboard/${organization.slug}/leave/policies`,
      icon: ClipboardListIcon,
    },
    {
      name: "Recruits",
      url: `/dashboard/${organization.slug}/recruits`,
      icon: UserSearchIcon,
    },
    {
      name: "Reports",
      url: `/dashboard/${organization.slug}/reports`,
      icon: FileChartColumnIncreasingIcon,
    },
    {
      name: "Calendars",
      url: `/dashboard/${organization.slug}/calendars`,
      icon: CalendarDaysIcon,
    },
    {
      name: "Settings",
      url: `/dashboard/${organization.slug}/settings`,
      icon: SettingsIcon,
    },
  ]);
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <OrganizationSwitcher
      {orgs}
      activeOrganization={organization}
      onCreateOrganization={() => (open = true)}
    />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain features={data} />
    <NavSecondary
      class="mt-auto"
      items={[
        {
          url: `/app/${organization.slug}`,
          icon: AppWindowIcon,
          title: "Application",
          fullReload: true,
        },
      ]}
    />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>

<AddOrganizationForm variant="dialog" bind:open />
