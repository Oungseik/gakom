<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button } from "@repo/ui/button";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { createForm } from "@tanstack/svelte-form";
  import { toast } from "svelte-sonner";
  import z from "zod";

  import { authClient } from "$lib/auth_client";

  type Props = {
    onSubmit?: (param: { email: string }) => void;
    onSubmitError?: () => void;
  };

  let isSubmitting = $state(false);
  const { onSubmit, onSubmitError }: Props = $props();

  const form = createForm(() => ({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      isSubmitting = true;
      await authClient.forgetPassword.emailOtp(
        { email: value.email },
        {
          onSuccess: () => {
            onSubmit?.(value);
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
    <form.Field
      name="email"
      validators={{
        onChange: ({ value }) => z.email().safeParse(value).error?.issues?.at(0)?.message,
      }}
    >
      {#snippet children(field)}
        <div class="space-y-2">
          <Label for={field.name}>Email</Label>
          <Input
            id={field.name}
            name={field.name}
            value={field.state.value}
            type="email"
            onblur={field.handleBlur}
            onchange={(e) => field.handleChange(e.currentTarget.value)}
            placeholder="m@example.com"
            required
            disabled={isSubmitting}
          />
          {#if field.state.meta.errors.length}
            <p class="text-sm text-red-500">{field.state.meta.errors}</p>
          {/if}
        </div>
      {/snippet}
    </form.Field>

    <Button disabled={isSubmitting} type="submit" class="w-full">
      {#if isSubmitting}
        <Loader2Icon class="animate-spin" />
      {:else}
        Send OTP
      {/if}
    </Button>
  </div>
</form>
