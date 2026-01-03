<script lang="ts">
  import { formatDate, getDaysDifference } from "$lib/utils";

  const { startDate, endDate }: { startDate: Date; endDate: Date } = $props();

  const date = $derived.by(() =>
    startDate === endDate
      ? `${formatDate(startDate)}`
      : `${formatDate(startDate)} - ${formatDate(endDate)}`
  );

  const days = $derived.by(() => {
    const days = getDaysDifference(endDate, startDate) + 1;
    return days === 1 ? `${days} day` : `${days} days`;
  });
</script>

<div class="flex flex-col">
  <span class="text-sm font-medium">{days}</span>
  <span class="text-muted-foreground text-sm">{date}</span>
</div>
