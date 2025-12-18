<script lang="ts">
  import { Button } from "@repo/ui/button";

  import { page } from "$app/state";

  import type { LayoutProps } from "./$types";

  const { data }: LayoutProps = $props();

  const org = $derived(
    data.organizations.find((org) => org.id == data.session.activeOrganizationId)
  );

  const href = $derived(org ? `/app/dashboard/${org.slug}` : "/app/dashboard");
</script>

<div class="mx-auto min-h-dvh max-w-7xl pt-42">
  <div class="space-y-4 text-center">
    <h1 class="text-primary text-5xl font-bold md:text-7xl">{page.status}</h1>

    {#if page.status === 403}
      <h2 class="text-xl md:text-3xl">Forbidden</h2>
      <p class="text-muted-foreground text-sm md:text-base">
        You are not allow to perform this operation.
      </p>

      <Button {href} class="mt-8">Back to dashboard</Button>
    {/if}

    {#if page.status === 404}
      <h2 class="text-xl md:text-3xl">Something's missing.</h2>
      <p class="text-muted-foreground text-sm md:text-base">
        Sorry, we can't find that page. You'll find lots to explore on the home page.
      </p>

      <Button {href} class="mt-8">Back to dashboard</Button>
    {/if}

    {#if page.status === 500}
      <h2 class="text-xl md:text-3xl">Internal Server Error</h2>
      <p class="text-muted-foreground text-sm md:text-base">
        We are already working to solve the problem.
      </p>
    {/if}
  </div>
</div>
