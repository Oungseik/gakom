<script lang="ts">
  import SearchIcon from "@lucide/svelte/icons/search";
  import { Input } from "@repo/ui/input";

  let { value = $bindable() } = $props();
</script>

<div class="relative">
  <SearchIcon class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
  <Input
    type="search"
    placeholder="Search name or email..."
    class="w-[200px] pl-9 sm:w-[300px]"
    bind:value
  />
</div>
