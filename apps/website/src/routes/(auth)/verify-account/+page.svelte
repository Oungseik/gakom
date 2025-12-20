<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import { createForm } from "@tanstack/svelte-form";
  import { toast } from "svelte-sonner";

  import { page } from "$app/state";
  import { authClient } from "$lib/auth_client";

  import NavigationIcon from "../NavigationIcon.svelte";
  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
  const defaultValues = $derived({ email: data.user?.email ?? "" });

  let isResending = $state(false);
  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isResending = true;
      await authClient.sendVerificationEmail(
        {
          email: value.email,
          callbackURL: page.url.searchParams.get("return_url") ?? "/app",
        },
        {
          onResponse: () => void (isResending = false),
          onSuccess: () => void toast.success("Verification email sent!"),
          onError: ({ error }) => void toast.error(error.message),
        }
      );
    },
  }));
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <NavigationIcon />

    <Card.Root>
      <Card.Header class="text-center">
        <Card.Title class="text-xl">Verify Your Email</Card.Title>
        <Card.Description>
          Check your email for a verification link. If you didn't receive it, enter your email below
          to resend the verification email.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {#if page.url.searchParams.get("error") === "invalid_token"}
          <div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
            <p class="text-sm text-red-600">
              Invalid or expired verification token. Please try resending the verification email.
            </p>
          </div>
        {/if}

        <form
          class="space-y-4"
          onsubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field name="email">
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
                />
                {#if field.state.meta.errors.length}
                  <p class="text-sm text-red-500">{field.state.meta.errors}</p>
                {/if}
              </div>
            {/snippet}
          </form.Field>

          <Button disabled={isResending} type="submit" class="w-full">
            {#if isResending}
              <Loader2Icon class="mr-2 size-4 animate-spin" />
              Resending...
            {:else}
              Resend Verification Email
            {/if}
          </Button>
        </form>

        <div class="mt-6 text-center text-sm">
          <a
            href={`/signin${page.url.search}`}
            class="underline underline-offset-4 hover:underline"
          >
            Back to Sign In
          </a>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
