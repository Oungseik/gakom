<script lang="ts">
  import * as Card from "@repo/ui/card";
  import { Skeleton } from "@repo/ui/skeleton";
</script>

<Card.Card>
  <Card.Content class="flex items-center justify-between pt-4">
    <div>
      <Skeleton class="mb-1 h-5 w-24" />
      <Skeleton class="h-8 w-16" />
    </div>
    <Skeleton class="size-6" />
  </Card.Content>
</Card.Card>
