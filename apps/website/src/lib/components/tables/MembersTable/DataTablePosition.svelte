<script lang="ts">
  export let position: string | null | undefined;
  export let role: string;

  // Function to get role badge color based on role
  function getRoleBadgeClass(role: string): string {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "member":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  }

  // Capitalize first letter of role
  function capitalizeRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
</script>

<div class="flex flex-col gap-1.5">
  {#if position}
    <div class="text-foreground text-sm font-medium">
      {position}
    </div>
  {:else}
    <div class="text-muted-foreground text-sm italic">No position</div>
  {/if}
  <div>
    <span
      class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-gray-500/10 ring-inset {getRoleBadgeClass(
        role
      )}"
    >
      {capitalizeRole(role)}
    </span>
  </div>
</div>
