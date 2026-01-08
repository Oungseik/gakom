<script lang="ts">
  import MinusIcon from "@lucide/svelte/icons/minus";
  import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import UserMinusIcon from "@lucide/svelte/icons/user-minus";
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import UsersIcon from "@lucide/svelte/icons/users";
  import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";

  type Props = {
    title: string;
    value: number;
    icon: "users" | "user-plus" | "user-minus";
    trend?: number;
    trendLabel?: string;
  };

  let { title, value, icon, trend, trendLabel }: Props = $props();

  const iconComponents = {
    users: UsersIcon,
    "user-plus": UserPlusIcon,
    "user-minus": UserMinusIcon,
  };

  const Icon = $derived(iconComponents[icon]);

  const trendDirection = $derived(
    trend === undefined ? "neutral" : trend > 0 ? "up" : trend < 0 ? "down" : "neutral"
  );

  const trendColor = $derived(
    trendDirection === "up"
      ? "text-green-500"
      : trendDirection === "down"
        ? "text-red-500"
        : "text-muted-foreground"
  );
</script>

<Card>
  <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle class="text-muted-foreground text-sm font-medium">
      {title}
    </CardTitle>
    <Icon class="text-muted-foreground size-4" />
  </CardHeader>
  <CardContent>
    <div class="text-2xl font-bold">{value.toLocaleString()}</div>
    {#if trend !== undefined}
      <div class="flex items-center gap-1 text-xs {trendColor}">
        {#if trendDirection === "up"}
          <TrendingUpIcon />
        {:else if trendDirection === "down"}
          <TrendingDownIcon />
        {:else}
          <MinusIcon />
        {/if}
        <span>
          {#if trend > 0}+{/if}{trend}% {trendLabel ?? "from last month"}
        </span>
      </div>
    {/if}
  </CardContent>
</Card>
