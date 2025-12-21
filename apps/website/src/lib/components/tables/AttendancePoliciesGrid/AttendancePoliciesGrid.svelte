<script lang="ts" generics="TData">
  import PolicyCard from "./PolicyCard.svelte";
  import type { AttendancePolicy } from "./types";

  type AttendancePoliciesGridProps = {
    data: TData[];
  };

  let { data }: AttendancePoliciesGridProps = $props();
</script>

{#if data.length > 0}
  <div
    class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    style="grid-auto-flow: dense;"
  >
    {#each data as policy (policy.id)}
      <PolicyCard {policy} />
    {/each}
  </div>
{:else}
  <div class="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
    <div class="text-center">
      <p class="text-muted-foreground text-sm">No attendance policies found.</p>
      <p class="text-muted-foreground mt-1 text-xs">Create your first policy to get started.</p>
    </div>
  </div>
{/if}

