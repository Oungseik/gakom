<script lang="ts">
  import * as Sidebar from "@repo/ui/sidebar";

  import DashboardSidebar from "$lib/components/sidebar/DashboardSidebar.svelte";

  import { type LayoutProps } from "./$types";

  const { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider>
  <DashboardSidebar
    user={data.user}
    orgs={data.organizations}
    activeOrganizationId={data.session.activeOrganizationId}
  />
  <Sidebar.Inset>
    {@render children()}
  </Sidebar.Inset>
</Sidebar.Provider>
