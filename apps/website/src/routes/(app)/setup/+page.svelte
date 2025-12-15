<script lang="ts">
  import * as Card from "@repo/ui/card";

  import OrganizationCreationForm from "$lib/components/forms/OrganizationCreationForm.svelte";
</script>

<div class="mt-20 flex min-h-svh flex-col items-center gap-6 p-6 md:p-10">
  <div class="flex w-full max-w-md flex-col gap-6">
    <Card.Root>
      <Card.Content>
        <OrganizationCreationForm />
      </Card.Content>
    </Card.Root>

    <p class="text-muted-foreground text-center">
      Enter your information below to create an organization
    </p>
  </div>
</div>
