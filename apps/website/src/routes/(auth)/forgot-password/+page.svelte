<script lang="ts">
  import { buttonVariants } from "@repo/ui/button";
  import * as Card from "@repo/ui/card";

  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import NewPasswordForm from "$lib/components/forms/NewPasswordForm.svelte";
  import OTPVerificationForm from "$lib/components/forms/OTPVerificationForm.svelte";
  import PasswordResetForm from "$lib/components/forms/PasswordResetForm.svelte";
  import { localizeHref } from "$lib/paraglide/runtime";

  let submission = $state<
    | { status: "REQUEST_OTP" }
    | { status: "VERIFY_OTP"; email: string }
    | { status: "RESET_PASSWORD"; email: string; otp: string }
  >({ status: "REQUEST_OTP" });
</script>

<div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
  <div class="flex w-full max-w-sm flex-col gap-6">
    <a href={localizeHref("/")} class="flex items-center gap-2 self-center font-medium">
      <img src="/logo.svg" class="size-5" alt="logo" />
      <span>Doh Htar Nay</span>
    </a>

    <Card.Root>
      <Card.Header class="text-center">
        {#if submission.status === "REQUEST_OTP"}
          <Card.Title class="text-xl">Password reset link sent</Card.Title>
          <Card.Description>Check your email for a link to reset your password</Card.Description>
        {:else if submission.status === "VERIFY_OTP"}
          <Card.Title class="text-xl">Email verification</Card.Title>
          <Card.Description>
            Enter the 6-digit verification code that was sent to your email.
          </Card.Description>
        {:else}
          <Card.Title class="text-xl">Create new password</Card.Title>
          <Card.Description>
            Your new password must be different from previous used password.
          </Card.Description>
        {/if}
      </Card.Header>

      <Card.Content>
        {#if submission.status === "REQUEST_OTP"}
          <PasswordResetForm
            onSubmit={({ email }) => {
              submission = { status: "VERIFY_OTP", email };
            }}
          />
        {:else if submission.status === "VERIFY_OTP"}
          <OTPVerificationForm
            email={submission.email}
            type="forget-password"
            onSubmit={({ otp }) => {
              submission = {
                status: "RESET_PASSWORD",
                email: submission.status === "VERIFY_OTP" ? submission.email : "",
                otp,
              };
            }}
            onCancel={() => {
              submission = { status: "REQUEST_OTP" };
            }}
          />
        {:else}
          <NewPasswordForm
            email={submission.email}
            otp={submission.otp}
            onSubmit={() => {
              goto("/signin".concat(page.url.search));
            }}
          />
        {/if}

        <div class="mt-6 text-center text-sm">
          Remember the password?
          <a
            href={localizeHref(`/signin${page.url.search}`)}
            class={buttonVariants({ variant: "link", class: "px-0" })}
          >
            Sign in
          </a>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>
