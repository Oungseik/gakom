<script lang="ts">
  import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

  import { getNameIntials } from "$lib/utils";

  let {
    name,
    email,
    image,
    position,
  }: { name: string; email?: string; position?: string; image?: string | null } = $props();

  const { firstWord, secondWord } = $derived(getNameIntials(name));
</script>

<div class="flex items-center gap-3">
  <Avatar class="h-10 w-10 rounded-lg">
    {#if image}
      <AvatarImage src={image} alt={name} />
    {/if}
    <AvatarFallback class="bg-primary/10 text-primary rounded-lg font-medium">
      {firstWord}{secondWord}
    </AvatarFallback>
  </Avatar>
  <div class="flex flex-col">
    <span class="text-sm font-medium">{name}</span>
    <span class="text-muted-foreground text-sm">{email ? email : position}</span>
  </div>
</div>
