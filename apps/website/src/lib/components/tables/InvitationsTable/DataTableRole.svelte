<script lang="ts">
  import { getRoleBadgeClass } from "$lib/utils";

  const { role } = $props();
</script>

{#if role}
  <span
    class="inline-flex items-center rounded-md px-2 py-1 text-sm capitalize ring-1 ring-gray-500/10 ring-inset {getRoleBadgeClass(
      role
    )}"
  >
    {role.toLowerCase()}
  </span>
{:else}
  <span class="text-muted-foreground text-sm italic">No role</span>
{/if}
