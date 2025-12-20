<script lang="ts">
  let { userId }: { userId: string } = $props();

  const truncatedId = $derived(userId.slice(0, 8) + '...');
</script>

<span class="font-mono text-sm text-muted-foreground">
  {truncatedId}
</span>


