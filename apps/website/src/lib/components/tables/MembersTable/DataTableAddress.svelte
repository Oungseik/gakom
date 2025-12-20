<script lang="ts">
  import { COUNTRIES } from "@repo/db/country";

  let {
    address,
    city,
    countryCode,
  }: {
    address?: string | null;
    city?: string | null;
    countryCode?: string | null;
  } = $props();

  const countryName = $derived(countryCode ? COUNTRIES.get(countryCode as any)?.name : undefined);

  const hasAddressData = $derived(address || city || countryName);
</script>

{#if hasAddressData}
  <div class="flex flex-col gap-0.5">
    {#if address}
      <span class="text-sm">{address}</span>
    {/if}
    {#if city || countryName}
      <span class="text-muted-foreground text-sm">
        {#if city && countryName}
          {city}, {countryName}
        {:else if city}
          {city}
        {:else if countryName}
          {countryName}
        {/if}
      </span>
    {/if}
  </div>
{:else}
  <span class="text-muted-foreground text-sm">—</span>
{/if}
