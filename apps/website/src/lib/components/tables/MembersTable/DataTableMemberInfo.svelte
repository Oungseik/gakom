<script lang="ts">
  import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

  let { name, email, image }: { name: string; email: string; image?: string | null } = $props();

  function getInitials(name: string): string {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const initials = $derived(getInitials(name));
</script>

<div class="flex items-center gap-3">
  <Avatar class="h-10 w-10 rounded-lg">
    {#if image}
      <AvatarImage src={image} alt={name} />
    {/if}
    <AvatarFallback class="bg-primary/10 text-primary rounded-lg font-medium">
      {initials}
    </AvatarFallback>
  </Avatar>
  <div class="flex flex-col">
    <span class="text-sm font-medium">{name}</span>
    <span class="text-muted-foreground text-sm">{email}</span>
  </div>
</div>

