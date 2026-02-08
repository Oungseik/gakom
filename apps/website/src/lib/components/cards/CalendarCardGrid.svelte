<script lang="ts">
  import { Skeleton } from "@repo/ui/skeleton";

  import CalendarCard from "./CalendarCard.svelte";

  type Calendar = {
    id: string;
    name: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
  };

  type Props = {
    calendars: Calendar[];
    loading?: boolean;
  };

  let { calendars, loading = false }: Props = $props();
</script>

{#if loading}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    {#each Array(3) as _, i (i)}
      <div class="rounded-lg border p-4">
        <div class="flex items-start gap-3">
          <Skeleton class="h-10 w-10 shrink-0 rounded-lg" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-4 w-32" />
            <Skeleton class="h-3 w-16" />
          </div>
        </div>
        <div class="mt-3">
          <Skeleton class="h-3 w-24" />
        </div>
      </div>
    {/each}
  </div>
{:else if calendars.length === 0}
  <div
    class="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
  >
    <div class="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-muted-foreground"
      >
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    </div>
    <h3 class="mt-4 text-sm font-medium">No calendars</h3>
    <p class="text-muted-foreground mt-1 text-xs">Get started by creating a new calendar.</p>
  </div>
{:else}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    {#each calendars as calendar (calendar.id)}
      <a href="/dashboard/{calendar.slug}/calendars/{calendar.id}" class="block">
        <CalendarCard
          id={calendar.id}
          name={calendar.name}
          isDefault={calendar.isDefault}
          createdAt={calendar.createdAt}
          updatedAt={calendar.updatedAt}
          slug={calendar.slug}
        />
      </a>
    {/each}
  </div>
{/if}
