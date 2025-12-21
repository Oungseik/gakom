<script lang="ts">
  import CheckCircleIcon from "@lucide/svelte/icons/check-circle";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const href = $derived(
    data.invitedOrganizationId && data.organizations
      ? `/app/${data.organizations.find((o) => o.id === data.invitedOrganizationId)?.slug}`
      : "/app"
  );
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

      <Card.Content class="pt-0">
        <Button {href} class="w-full">Go to App</Button>
      </Card.Content>
    </Card.Root>
  </div>
</div>
