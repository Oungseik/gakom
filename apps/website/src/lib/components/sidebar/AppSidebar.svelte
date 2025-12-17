<script lang="ts" module>
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import BotIcon from "@lucide/svelte/icons/bot";
  import ChartPieIcon from "@lucide/svelte/icons/chart-pie";
  import FrameIcon from "@lucide/svelte/icons/frame";
  import MapIcon from "@lucide/svelte/icons/map";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";

  // This is sample data.
  const data = {
    navMain: [
      {
        title: "Playground",
        url: "#",
        icon: SquareTerminalIcon,
        isActive: true,
        items: [
          {
            title: "History",
            url: "#",
          },
          {
            title: "Starred",
            url: "#",
          },
          {
            title: "Settings",
            url: "#",
          },
        ],
      },
      {
        title: "Models",
        url: "#",
        icon: BotIcon,
        items: [
          {
            title: "Genesis",
            url: "#",
          },
          {
            title: "Explorer",
            url: "#",
          },
          {
            title: "Quantum",
            url: "#",
          },
        ],
      },
      {
        title: "Documentation",
        url: "#",
        icon: BookOpenIcon,
        items: [
          {
            title: "Introduction",
            url: "#",
          },
          {
            title: "Get Started",
            url: "#",
          },
          {
            title: "Tutorials",
            url: "#",
          },
          {
            title: "Changelog",
            url: "#",
          },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2Icon,
        items: [
          {
            title: "General",
            url: "#",
          },
          {
            title: "Team",
            url: "#",
          },
          {
            title: "Billing",
            url: "#",
          },
          {
            title: "Limits",
            url: "#",
          },
        ],
      },
    ],
    projects: [
      {
        name: "Design Engineering",
        url: "#",
        icon: FrameIcon,
      },
      {
        name: "Sales & Marketing",
        url: "#",
        icon: ChartPieIcon,
      },
      {
        name: "Travel",
        url: "#",
        icon: MapIcon,
      },
    ],
  };
</script>

<script lang="ts">
  import * as Sidebar from "@repo/ui/sidebar";
  import type { ComponentProps } from "svelte";

  import NavMain from "$lib/components/navigation/NavMain.svelte";
  import NavProjects from "$lib/components/navigation/NavProject.svelte";
  import NavUser from "$lib/components/navigation/NavUser.svelte";
  import OrganizationSwitcher from "$lib/components/switchers/OrganizationSwitcher.svelte";

  type User = {
    email: string;
    name: string;
    logo?: string | null;
  };

  type Organization = {
    id: string;
    name: string;
    logo: string;
    slug: string;
    plan?: string;
  };

  let {
    collapsible = "icon",
    user,
    orgs,
    activeOrganizationId,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: User;
    orgs: Organization[];
    activeOrganizationId?: string;
  } = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <OrganizationSwitcher {orgs} {activeOrganizationId} />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} />
    <NavProjects projects={data.projects} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>
