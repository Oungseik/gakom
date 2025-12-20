<script lang="ts">
  import AddOrganizationForm from "$lib/components/forms/AddOrganizationForm.svelte";

  import NavigationIcon from "../NavigationIcon.svelte";
</script>

<div class="mt-20 flex min-h-svh flex-col items-center gap-6 p-6 md:p-10">
  <div class="flex w-full max-w-md flex-col gap-6">
    <NavigationIcon />

    <AddOrganizationForm variant="card" />

    <p class="text-muted-foreground text-center">
      Enter your information below to create an organization
    </p>
  </div>
</div>
