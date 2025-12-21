<script lang="ts">
  import ClipboardClockIcon from "@lucide/svelte/icons/clipboard-clock";
  import UsersIcon from "@lucide/svelte/icons/users";
  import * as Sidebar from "@repo/ui/sidebar";
  import type { ComponentProps } from "svelte";

  import NavManagement from "$lib/components/navigation/NavManagement.svelte";
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
    collapsible = "offcanvas",
    user,
    orgs,
    currentOrganizationSlug,
    ...restProps
  }: ComponentProps<typeof Sidebar.Root> & {
    user: User;
    orgs: Organization[];
    currentOrganizationSlug?: string | null;
  } = $props();

  const activeOrganization = $derived(
    orgs.find((o) => o.slug === currentOrganizationSlug) ?? orgs.at(0)!
  );
  let open = $state(false);

  const data = $derived({
    managements: [
      {
        name: "Members",
        url: `/dashboard/${activeOrganization.slug}/members`,
        icon: UsersIcon,
      },
      {
        name: "Attendances",
        url: `/dashboard/${activeOrganization.slug}/attendances`,
        icon: ClipboardClockIcon,
      },
    ],
  });
</script>

<Sidebar.Root {collapsible} {...restProps}>
  <Sidebar.Header>
    <OrganizationSwitcher {orgs} {activeOrganization} onCreateOrganization={() => (open = true)} />
  </Sidebar.Header>
  <Sidebar.Content>
    <NavManagement features={data.managements} slug={currentOrganizationSlug} />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser {user} />
  </Sidebar.Footer>
  <Sidebar.Rail />
</Sidebar.Root>

<AddOrganizationForm variant="dialog" bind:open />
