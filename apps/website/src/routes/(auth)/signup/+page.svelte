<script lang="ts">
  import Loader2Icon from "@lucide/svelte/icons/loader-2";
  import { buttonVariants } from "@repo/ui/button";
  import { Button } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";
  import { Input } from "@repo/ui/input";
  import { Label } from "@repo/ui/label";
  import * as Password from "@repo/ui/password";
  import { createForm } from "@tanstack/svelte-form";
  import { useSearchParams } from "runed/kit";
  import { toast } from "svelte-sonner";
  import z from "zod";

  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { authClient } from "$lib/auth_client";
  import SocialOauthBtnsGroup from "$lib/components/groups/SocialOAuthBtnsGroup.svelte";
  import { returnUrlSchema } from "$lib/searchParams";

  import NavigationIcon from "../NavigationIcon.svelte";

  let isSubmitting = $state(false);
  const defaultValues = { name: "", email: "", password: "" };

  const params = useSearchParams(returnUrlSchema);

  const form = createForm(() => ({
    defaultValues,
    onSubmit: async ({ value }) => {
      isSubmitting = true;
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
          callbackURL: params.return_url
            ? "/signin".concat(`?return_url=${params.return_url}`)
            : "/signin",
        },
        {
          onSuccess: () => {
            isSubmitting = false;
            goto(
              params.return_url ? "/signin".concat(`?return_url=${params.return_url}`) : "/signin"
            );
          },
          onError: ({ error }) => {
            if (error.status === 403) {
              isSubmitting = false;
              return void toast.error("Please verify your email address");
            }
            isSubmitting = false;
            return void toast.error(error.message);
          },
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
        <Card.Title class="text-xl">Create an account</Card.Title>
        <Card.Description>Enter your information below to create your account</Card.Description>
      </Card.Header>
      <Card.Content>
        <form
          class="space-y-6"
          onsubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div class="space-y-4">
            <form.Field name="name">
              {#snippet children(field)}
                <div class="space-y-2">
                  <Label for={field.name}>Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={field.state.value}
                    type="text"
                    onblur={field.handleBlur}
                    onchange={(e) => field.handleChange(e.currentTarget.value)}
                    placeholder="Your name"
                    required
                  />
                  {#if field.state.meta.errors.length}
                    <p class="text-sm text-red-500">{field.state.meta.errors}</p>
                  {/if}
                </div>
              {/snippet}
            </form.Field>

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
                  />
                  {#if field.state.meta.errors.length}
                    <p class="text-sm text-red-500">{field.state.meta.errors}</p>
                  {/if}
                </div>
              {/snippet}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  z
                    .string()
                    .min(8, "Password must be at least 8 characters")
                    .max(32, "Password cannot exceed 32 characters")
                    .regex(/[a-z]/, "Password must contain a lowercase letter")
                    .regex(/[A-Z]/, "Password must contain an uppercase letter")
                    .regex(/[0-9]/, "Password must contain a number")
                    .regex(/[^A-Za-z0-9]/, "Password must contain a symbol")
                    .safeParse(value)
                    .error?.issues?.at(0)?.message,
              }}
            >
              {#snippet children(field)}
                <div class="space-y-2">
                  <Label for={field.name}>Password</Label>
                  <Password.Root>
                    <Password.Input
                      required
                      onchange={(e) => {
                        if (e.target instanceof HTMLInputElement) {
                          field.handleChange(e.target.value);
                        }
                      }}
                    >
                      <Password.ToggleVisibility />
                    </Password.Input>
                    <Password.Strength />
                  </Password.Root>
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
                Sign up
              {/if}
            </Button>
          </div>
        </form>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="border-border w-full border-t"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background text-muted-foreground px-2"> Or continue with </span>
          </div>
        </div>

        <SocialOauthBtnsGroup />

        <div class="mt-6 text-center text-sm">
          Already have an account?
          <a
            href={`/signin${page.url.search}`}
            class={buttonVariants({ variant: "link", class: "px-0" })}
          >
            Sign in
          </a>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
