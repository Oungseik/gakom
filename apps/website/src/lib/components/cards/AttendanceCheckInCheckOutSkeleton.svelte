<script lang="ts">
  import * as Card from "@repo/ui/card";
  import { Skeleton } from "@repo/ui/skeleton";
</script>

<Card.Root class="h-62">
  <Card.Header>
    <Skeleton class="h-5 w-40" />
  </Card.Header>
  <Card.Content class="space-y-4">
    <div>
      <Skeleton class="h-4 w-full" />
    </div>

    <div class="flex items-center justify-between">
      <div class="space-y-2">
        <Skeleton class="h-7 w-32" />
        <Skeleton class="h-7 w-32" />
      </div>
      <div class="space-y-2">
        <Skeleton class="h-7 w-24" />
        <Skeleton class="h-7 w-24" />
      </div>
    </div>
  </Card.Content>
  <Card.Footer>
    <Skeleton class="h-8 w-full" />
  </Card.Footer>
</Card.Root>
