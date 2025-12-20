<script lang="ts">
  let { joinedAt, leftAt }: { joinedAt: Date; leftAt?: Date | null } = $props();

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const formattedJoinDate = $derived(formatDate(joinedAt));
  const formattedLeftDate = $derived(leftAt ? formatDate(leftAt) : 'Present');
</script>

<div class="flex flex-col">
  <span class="font-medium text-sm">{formattedJoinDate}</span>
  <span class="text-xs text-muted-foreground">{formattedLeftDate}</span>
</div>

