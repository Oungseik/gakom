<script lang="ts">
  import DashboardContainer from "$lib/components/containers/DashboardContainer.svelte";
  import DashboardHeader from "$lib/components/headers/DashboardHeader.svelte";

  import type { PageProps } from "./$types.js";

  const { params }: PageProps = $props();
</script>

<DashboardHeader breadcrumbItems={[{ desc: "Dashboard", href: `/dashboard/${params.slug}` }]} />

<DashboardContainer>
  <div class="grid auto-rows-min gap-4 md:grid-cols-3">
    <div class="bg-muted/50 aspect-video rounded-xl"></div>
    <div class="bg-muted/50 aspect-video rounded-xl"></div>
    <div class="bg-muted/50 aspect-video rounded-xl"></div>
  </div>
  <div class="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min"></div>
</DashboardContainer>
