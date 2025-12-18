<script lang="ts">
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/app/dashboard/${params.slug}` },
    { desc: "Members", href: `/app/dashboard/${params.slug}/members` },
  ]}
/>

<DashboardContainer>
  <h1>Hello</h1>
</DashboardContainer>
