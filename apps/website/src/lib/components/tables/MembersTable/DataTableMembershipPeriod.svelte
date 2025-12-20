<script lang="ts">
  import { formatDate } from "$lib/utils";

  let { joinedAt, leftAt }: { joinedAt: Date; leftAt?: Date | null } = $props();

  const formattedJoinDate = $derived(formatDate(joinedAt));
  const formattedLeftDate = $derived(leftAt ? formatDate(leftAt) : "Present");
</script>

<div class="flex flex-col">
  <span class="text-sm font-medium">{formattedJoinDate}</span>
  <span class="text-muted-foreground text-xs">{formattedLeftDate}</span>
</div>
