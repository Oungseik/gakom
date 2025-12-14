<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button } from "@repo/ui/button";
  import { Checkbox } from "@repo/ui/checkbox";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { createForm } from "@tanstack/svelte-form";
  import { toast } from "svelte-sonner";

  import { authClient } from "$lib/auth_client";

  type Props = {
    email: string;
    otp: string;
    onSubmit?: () => void;
    onSubmitError?: () => void;
  };

  let isSubmitting = $state(false);
  const { email, otp, onSubmit, onSubmitError }: Props = $props();

  const form = createForm(() => ({
    defaultValues: { password: "", logoutAll: false },
    onSubmit: async ({ value }) => {
      isSubmitting = true;
      await authClient.emailOtp.resetPassword(
        { email, otp, password: value.password },
        {
          onSuccess: () => {
            if (value.logoutAll) {
              authClient.revokeSessions();
            }
            onSubmit?.();
          },
          onError: ({ error }) => {
            toast.error(error.message);
            onSubmitError?.();
          },
        }
      );
      isSubmitting = false;
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
    <form.Field name="password">
      {#snippet children(field)}
        <div class="space-y-2">
          <Label for={field.name}>Password</Label>
          <Input
            type="password"
            id={field.name}
            name={field.name}
            value={field.state.value}
            onblur={field.handleBlur}
            onchange={(e) => field.handleChange(e.currentTarget.value)}
            required
          />
        </div>
      {/snippet}
    </form.Field>

    <form.Field name="logoutAll">
      {#snippet children(field)}
        <div class="flex items-center gap-3">
          <Checkbox
            id="terms"
            checked={field.state.value}
            onCheckedChange={(value) => field.handleChange(value)}
          />
          <Label for="terms">Log out from all devices</Label>
        </div>
      {/snippet}
    </form.Field>

    <Button disabled={isSubmitting} type="submit" class="w-full">
      {#if isSubmitting}
        <Loader2Icon class="animate-spin" />
      {:else}
        Confirm new password
      {/if}
    </Button>
  </div>
</form>
