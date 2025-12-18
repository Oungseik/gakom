<script lang="ts" module>
  import BookOpenIcon from "@lucide/svelte/icons/book-open";
  import BotIcon from "@lucide/svelte/icons/bot";
  import Settings2Icon from "@lucide/svelte/icons/settings-2";
  import SquareTerminalIcon from "@lucide/svelte/icons/square-terminal";
</script>

<script lang="ts">
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import * as Sidebar from "@repo/ui/sidebar";
  import type { ComponentProps } from "svelte";

  import NavMain from "$lib/components/navigation/NavMain.svelte";
  import NavOrganization from "$lib/components/navigation/NavOrganization.svelte";
  import NavUser from "$lib/components/navigation/NavUser.svelte";
  import OrganizationSwitcher from "$lib/components/switchers/OrganizationSwitcher.svelte";

  import AddOrganizationForm from "../forms/AddOrganizationForm.svelte";

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
    activeOrganizationId?: string | null;
  } = $props();

  const activeOrganization = $derived(
    orgs.find((o) => o.id === activeOrganizationId) ?? orgs.at(0)!
  );
  let open = $state(false);

  const data = $derived({
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
    organization: [
      {
        name: "Members",
        url: `/app/dashboard/${activeOrganization.slug}/members`,
        icon: UserPlusIcon,
      },
    ],
  });
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <OrganizationSwitcher {orgs} {activeOrganization} onCreateOrganization={() => (open = true)} />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} />
    <NavOrganization features={data.organization} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>

<AddOrganizationForm variant="dialog" bind:open />
