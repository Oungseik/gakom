<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import CheckIcon from "@lucide/svelte/icons/check";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import * as Card from "@repo/ui/card";

  type Props = {
    data: {
      totalPendingRequests: number;
      totalApprovedToday: number;
      totalOnLeaveToday: number;
    };
  };

  const { data }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
  <Card.Card>
    <Card.Content class="flex items-center justify-between pt-4">
      <div>
        <p class="text-muted-foreground mb-1 text-sm">Pending Requests</p>
        <p class="text-2xl font-bold">{data.totalPendingRequests}</p>
      </div>
      <CheckIcon class="size-6 text-amber-500" />
    </Card.Content>
  </Card.Card>

  <Card.Card>
    <Card.Content class="flex items-center justify-between pt-4">
      <div>
        <p class="text-muted-foreground mb-1 text-sm">Approved Today</p>
        <p class="text-2xl font-bold">{data.totalApprovedToday}</p>
      </div>
      <CalendarIcon class="size-6 text-emerald-500" />
    </Card.Content>
  </Card.Card>

  <Card.Card>
    <Card.Content class="flex items-center justify-between pt-4">
      <div>
        <p class="text-muted-foreground mb-1 text-sm">On Leave Today</p>
        <p class="text-2xl font-bold">{data.totalOnLeaveToday}</p>
      </div>
      <ClockIcon class="text-primary size-6" />
    </Card.Content>
  </Card.Card>
</div>
