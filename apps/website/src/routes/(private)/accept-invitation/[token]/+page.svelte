<script lang="ts">
  import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
  import { buttonVariants } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
  <div class="w-full max-w-sm">
    <Card.Root>
      <Card.Header class="pb-2 text-center">
        <div class="mb-4 flex justify-center">
          <CheckCircleIcon class="h-16 w-16 text-green-600" />
        </div>
        <Card.Title class="text-2xl">Invitation Accepted!</Card.Title>
        <Card.Description>
          Thank you for accepting the invitation. You're now part of the organization.
        </Card.Description>
      </Card.Header>

      <Card.Footer class="pt-0">
        <a
          href={`/app/${data.slug}`}
          class={[buttonVariants({ variant: "default" }), "w-full"]}
          data-sveltekit-reload
        >
          Go to app</a
        >
      </Card.Footer>
    </Card.Root>
  </div>
</div>
