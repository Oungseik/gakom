<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import LogInIcon from "@lucide/svelte/icons/log-in";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import UserXIcon from "@lucide/svelte/icons/user-x";
  import * as Card from "@repo/ui/card";

  type Props = {
    data: {
      totalPresent: number;
      lateArrivals: number;
      earlyDepartures: number;
      pendingCheckouts: number;
      absents: number;
    };
  };
  const { data }: Props = $props();
</script>

<Card.Card>
  <Card.Content class="flex items-center justify-between pt-4">
    <div>
      <p class="text-muted-foreground mb-1 text-sm">Absents</p>
      <p class="text-2xl font-bold">{data.absents}</p>
    </div>
    <UserXIcon class="size-6 text-red-500" />
  </Card.Content>
</Card.Card>

<Card.Card>
  <Card.Content class="flex items-center justify-between pt-4">
    <div>
      <p class="text-muted-foreground mb-1 text-sm">Late Arrivals</p>
      <p class="text-2xl font-bold">{data.lateArrivals}</p>
    </div>
    <ClockIcon class="size-6 text-amber-500" />
  </Card.Content>
</Card.Card>

<Card.Card>
  <Card.Content class="flex items-center justify-between pt-4">
    <div>
      <p class="text-muted-foreground mb-1 text-sm">Early Departures</p>
      <p class="text-2xl font-bold">{data.earlyDepartures}</p>
    </div>
    <LogOutIcon class="size-6 text-yellow-500" />
  </Card.Content>
</Card.Card>

<Card.Card>
  <Card.Content class="flex items-center justify-between pt-4">
    <div>
      <p class="text-muted-foreground mb-1 text-sm">Pending Check-outs</p>
      <p class="text-2xl font-bold">{data.pendingCheckouts}</p>
    </div>
    <CalendarIcon class="size-6 text-lime-500" />
  </Card.Content>
</Card.Card>

<Card.Card>
  <Card.Content class="flex items-center justify-between pt-4">
    <div>
      <p class="text-muted-foreground mb-1 text-sm">Total Present</p>
      <p class="text-2xl font-bold">{data.totalPresent}</p>
    </div>
    <LogInIcon class="size-6 text-green-500" />
  </Card.Content>
</Card.Card>
