<script lang="ts">
  let { userId }: { userId: string } = $props();

  const truncatedId = $derived(userId.slice(0, 8) + "...");
</script>

<span class="text-muted-foreground font-mono text-sm">
  {truncatedId}
</span>
