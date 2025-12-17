<script lang="ts">
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import * as DropdownMenu from "@repo/ui/dropdown-menu";
  import * as Sidebar from "@repo/ui/sidebar";
  import { useSidebar } from "@repo/ui/sidebar";
  import { toast } from "svelte-sonner";

  import { authClient } from "$lib/auth_client";

  type Props = {
    orgs: { id: string; name: string; logo: string; slug: string; plan?: string }[];
    activeOrganizationId?: string | null;
    onCreateOrganization: () => void;
  };

  let { orgs, activeOrganizationId, onCreateOrganization }: Props = $props();
  let activeOrganization = $derived(orgs.find((o) => o.id === activeOrganizationId) ?? orgs[0]);

  const sidebar = useSidebar();

  async function handleSwitchOrganization(param: { id: string; slug: string }) {
    if (activeOrganization.id === param.id) {
      return;
    }
    await authClient.organization
      .setActive({
        organizationId: param.id,
        organizationSlug: param.slug,
      })
      .then(() => (window.location.href = `/app/dashboard/${param.slug}`))
      .catch((e) => toast.error(e));
  }
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <img
              src={activeOrganization.logo}
              class="aspect-square size-8 rounded-lg border"
              alt={activeOrganization.name}
            />
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">
                {activeOrganization.name}
              </span>
              <span class="truncate text-xs">{activeOrganization.plan ?? "Free"}</span>
            </div>
            <ChevronsUpDownIcon class="ms-auto" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        sideOffset={4}
      >
        <DropdownMenu.Label class="text-muted-foreground text-xs">Organizations</DropdownMenu.Label>
        {#each orgs as org (org.slug)}
          <DropdownMenu.Item
            onSelect={() => {
              handleSwitchOrganization({ id: org.id, slug: org.slug });
            }}
            class="gap-2 p-2"
          >
            <img src={org.logo} class="size-6 shrink-0 rounded-md border" alt={org.name} />
            {org.name}
          </DropdownMenu.Item>
        {/each}
        <DropdownMenu.Separator />
        <DropdownMenu.Item class="gap-2 p-2" onclick={onCreateOrganization}>
          <div class="flex size-6 items-center justify-center rounded-md border bg-transparent">
            <PlusIcon class="size-4" />
          </div>
          <div class="text-muted-foreground font-medium">Create organization</div>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>
