<script lang="ts">
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<div class="flex h-[calc(100dvh-70px)] flex-col items-center justify-center">
  <div class="text-center">
    <h1 class="text-4xl font-bold tracking-tight">Coming Soon</h1>
    <p class="mt-2 text-muted-foreground">This feature is under development.</p>
  </div>
</div>
