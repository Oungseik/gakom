<script lang="ts">
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();
</script>

<DashboardHeader
  breadcrumbItems={[
    { desc: "Dashboard", href: `/dashboard/${params.slug}` },
    { desc: "Attendances", href: `/dashboard/${params.slug}/attendances` },
  ]}
/>

<DashboardContainer><h1>Attendance</h1></DashboardContainer>
