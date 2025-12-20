<script lang="ts">
  import { Button } from "@repo/ui/button";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const href = $derived(
    data.invitedOrganizationId && data.organizations
      ? `/app/${data.organizations.find((o) => o.id === data.invitedOrganizationId)?.slug}`
      : "/app"
  );
</script>

<div class="mt-20 flex min-h-svh flex-col items-center gap-6 p-6 md:p-10">
  <div class="flex w-full max-w-md flex-col gap-6">
    <div class="bg-card text-card-foreground flex flex-col gap-6 rounded-lg border p-8 shadow-sm">
      <div class="flex flex-col gap-2 text-center">
        <div class="mb-4 flex justify-center">
          <svg
            class="text-primary h-16 w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold tracking-tight">Invitation Accepted!</h1>
        <p class="text-muted-foreground">
          Thank you for accepting the invitation. You're now part of the organization.
        </p>
      </div>

      <Button {href} class="w-full">Go to App</Button>
    </div>
  </div>
</div>
