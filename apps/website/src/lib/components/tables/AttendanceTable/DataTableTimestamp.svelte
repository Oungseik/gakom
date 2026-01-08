<script lang="ts">
  type Props = {
    timestamp: Date;
  };

  let { timestamp }: Props = $props();

  const formattedTime = $derived(timestamp.toLocaleTimeString("en-US", { hour12: false }));
  const formattedDate = $derived(timestamp.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }));
</script>

<div class="flex flex-col">
  <span class="text-sm font-medium">{formattedTime}</span>
  <span class="text-muted-foreground text-xs">{formattedDate}</span>
</div>
