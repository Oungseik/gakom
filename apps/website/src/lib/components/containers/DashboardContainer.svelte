<script lang="ts">
  const { children } = $props();
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
  {@render children()}
</div>
