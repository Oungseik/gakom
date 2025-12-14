<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button } from "@repo/ui/button";
  import * as InputOTP from "@repo/ui/input-otp";
  import { createForm } from "@tanstack/svelte-form";
  import { toast } from "svelte-sonner";

  import { authClient } from "$lib/auth_client";

  type Props = {
    email: string;
    type: "forget-password" | "email-verification" | "sign-in";
    onSubmit?: (param: { otp: string }) => void;
    onCancel?: () => void;
    onSubmitError?: () => void;
  };

  let otp = $state("");
  let isVerifying = $state(false);
  const { email, type, onSubmit, onSubmitError, onCancel }: Props = $props();

  const form = createForm(() => ({
    defaultValues: { otp: "" },
    onSubmit: async () => {
      isVerifying = true;
      await authClient.emailOtp.checkVerificationOtp(
        { email, otp, type },
        {
          onSuccess: () => {
            onSubmit?.({ otp });
          },
          onError: ({ error }) => {
            toast.error(error.message);
            onSubmitError?.();
          },
        }
      );
      isVerifying = false;
    },
  }));
</script>

<form
  class="space-y-6"
  onsubmit={(e) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  }}
>
  <div class="space-y-4">
    <form.Field name="otp">
      {#snippet children()}
        <InputOTP.Root maxlength={6} bind:value={otp} class="my-8">
          {#snippet children({ cells })}
            <InputOTP.Group
              class="flex w-full items-center justify-between  gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border"
            >
              {#each cells as cell (cell)}
                <InputOTP.Slot {cell} class="size-12" />
              {/each}
            </InputOTP.Group>
          {/snippet}
        </InputOTP.Root>
      {/snippet}
    </form.Field>

    <Button disabled={isVerifying} type="submit" class="w-full">
      {#if isVerifying}
        <Loader2Icon class="animate-spin" />
      {:else}
        Confirm
      {/if}
    </Button>
    <Button type="button" variant="outline" class="w-full" onclick={() => onCancel?.()}>Back</Button
    >

    <div class="mt-6 text-center text-sm">
      Didn't receive code?
      <Button
        variant="link"
        class="px-0"
        onclick={() => authClient.forgetPassword.emailOtp({ email })}>Resend</Button
      >
    </div>
  </div>
</form>
