<script lang="ts">
  import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
  import * as Card from "@repo/ui/card";

  type Props = {
    message: string;
  };

  const { message }: Props = $props();
</script>

<Card.Root class="h-62">
  <Card.Header>
    <Card.Title class="text-muted-foreground">Today's Attendance</Card.Title>
  </Card.Header>
  <Card.Content class="flex h-full items-center justify-center">
    <div class="flex flex-col items-center gap-4 text-center">
      <AlertTriangleIcon class="size-12 text-yellow-500" />
      <div class="text-sm font-medium text-yellow-500">{message}</div>
    </div>
  </Card.Content>
</Card.Root>
