<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { COUNTRY_CODES } from "@repo/config";
  import { Button, buttonVariants } from "@repo/ui/button";
  import * as Dialog from "@repo/ui/dialog";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Select from "@repo/ui/select";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { toast } from "svelte-sonner";

  import { orpc } from "$lib/orpc_client";

  type Props = {
    address?: string | null;
    city?: string | null;
    countryCode?: string | null;
    slug: string;
    open: boolean;
  };

  let { open = $bindable(false), slug, ...props }: Props = $props();
  let isUpdating = $state(false);
  const queryClient = useQueryClient();

  const memberUpdateContact = createMutation(() => orpc.members.updateContact.mutationOptions());

  let address = $state(props.address ?? "");
  let city = $state(props.city ?? "");
  let countryCode = $state(props.countryCode ?? "");

  $effect(() => {
    if (open) {
      address = props.address ?? "";
      city = props.city ?? "";
      countryCode = props.countryCode ?? "";
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    isUpdating = true;

    memberUpdateContact.mutate(
      {
        slug,
        data: {
          address: address || null,
          city: city || null,
          countryCode: countryCode || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Contact information updated successfully");
          queryClient.invalidateQueries({ queryKey: orpc.members.get.key() });
          open = false;
          isUpdating = false;
        },
        onError: (error) => {
          toast.error(error.message);
          isUpdating = false;
        },
      }
    );
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit Contact Information</Dialog.Title>
    </Dialog.Header>

    <form class="space-y-4" onsubmit={handleSubmit}>
      <div class="space-y-2">
        <Label for="address">Address</Label>
        <Input
          id="address"
          bind:value={address}
          type="text"
          placeholder="123 Main Street"
          disabled={isUpdating}
        />
      </div>

      <div class="space-y-2">
        <Label for="city">City</Label>
        <Input
          id="city"
          bind:value={city}
          type="text"
          placeholder="New York"
          disabled={isUpdating}
        />
      </div>

      <div class="space-y-2">
        <Label for="country">Country</Label>
        <Select.Root type="single" bind:value={countryCode} disabled={isUpdating}>
          <Select.Trigger class="w-full">
            {countryCode ? countryCode : "Select a country"}
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">Select a country</Select.Item>
            {#each COUNTRY_CODES as code (code)}
              <Select.Item value={code}>{code}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      <Dialog.Footer>
        <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}
          >Cancel</Dialog.Close
        >
        <Button type="submit" disabled={isUpdating} class="w-17">
          {#if isUpdating}
            <Loader2Icon class="size-4 animate-spin" />
          {:else}
            Save
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
