<script lang="ts">
  import BriefcaseIcon from "@lucide/svelte/icons/briefcase";
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import MailIcon from "@lucide/svelte/icons/mail";
  import MapPinIcon from "@lucide/svelte/icons/map-pin";
  import ShieldIcon from "@lucide/svelte/icons/shield";
  import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
  import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
  import { createQuery } from "@tanstack/svelte-query";

  import { orpc } from "$lib/orpc_client";
  import { getNameIntials } from "$lib/utils";

  import type { PageProps } from "./$types";

  const { params }: PageProps = $props();

  const member = createQuery(() =>
    orpc.members.get.queryOptions({
      input: { slug: params.slug },
      enabled: !!params.slug,
    })
  );

  const { firstWord, secondWord } = $derived(
    member.data ? getNameIntials(member.data.name) : { firstWord: "", secondWord: "" }
  );

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
</script>

<div class="flex h-[calc(100dvh-70px)] flex-col items-center justify-center p-4">
  <div class="w-full max-w-2xl space-y-6">
    {#if member.isLoading}
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center space-y-4">
            <div class="bg-muted h-24 w-24 animate-pulse rounded-full"></div>
            <div class="bg-muted h-6 w-48 animate-pulse rounded"></div>
            <div class="bg-muted h-4 w-32 animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    {:else if member.data}
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col items-center space-y-4">
            <Avatar class="h-24 w-24 rounded-lg">
              {#if member.data.image}
                <AvatarImage src={member.data.image} alt={member.data.name} />
              {/if}
              <AvatarFallback class="bg-primary/10 text-primary rounded-lg text-2xl font-medium">
                {firstWord}{secondWord}
              </AvatarFallback>
            </Avatar>
            <div class="text-center">
              <h2 class="text-2xl font-bold">{member.data.name}</h2>
              {#if member.data.position}
                <p class="text-muted-foreground">{member.data.position}</p>
              {/if}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-3">
            <MailIcon class="text-muted-foreground size-5" />
            <div>
              <p class="text-muted-foreground text-sm">Email</p>
              <p class="font-medium">{member.data.email}</p>
            </div>
          </div>

          {#if member.data.address || member.data.city || member.data.countryCode}
            <div class="flex items-center gap-3">
              <MapPinIcon class="text-muted-foreground size-5" />
              <div>
                <p class="text-muted-foreground text-sm">Location</p>
                <p class="font-medium">
                  {[member.data.address, member.data.city, member.data.countryCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          {/if}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Organization Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center gap-3">
            <ShieldIcon class="text-muted-foreground size-5" />
            <div>
              <p class="text-muted-foreground text-sm">Role</p>
              <p class="font-medium capitalize">{member.data.role.toLowerCase()}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <BriefcaseIcon class="text-muted-foreground size-5" />
            <div>
              <p class="text-muted-foreground text-sm">Position</p>
              <p class="font-medium">{member.data.position ?? "Not set"}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <CalendarIcon class="text-muted-foreground size-5" />
            <div>
              <p class="text-muted-foreground text-sm">Joined</p>
              <p class="font-medium">{formatDate(member.data.joinedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    {:else if member.error}
      <Card>
        <CardContent class="pt-6">
          <div class="text-center">
            <p class="text-destructive">Failed to load profile</p>
            <p class="text-muted-foreground text-sm">{member.error.message}</p>
          </div>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>
