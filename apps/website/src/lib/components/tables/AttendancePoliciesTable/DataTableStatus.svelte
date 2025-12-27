<script lang="ts">
  import { getStatusBadgeClass } from "$lib/utils";

  const { status }: { status: "ENABLED" | "DISABLED" } = $props();
  const badgeClass = $derived(getStatusBadgeClass(status));
</script>

<span
  class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-gray-500/10 ring-inset {badgeClass}"
>
  {status}
</span>
