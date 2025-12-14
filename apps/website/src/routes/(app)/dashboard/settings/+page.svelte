<script lang="ts">
  import * as Card from "@repo/ui/card";

  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import NewPasswordForm from "$lib/components/forms/NewPasswordForm.svelte";
  import OTPVerificationForm from "$lib/components/forms/OTPVerificationForm.svelte";
  import PasswordResetForm from "$lib/components/forms/PasswordResetForm.svelte";
  import { breadcrumb } from "$lib/store/breadcrumb.svelte";

  breadcrumb.value = [
    { desc: "Dashboard", href: "/dashboard" },
    { desc: "Settings", href: "/dashboard/settings" },
  ];

  let submission = $state<
    | { status: "REQUEST_OTP" }
    | { status: "VERIFY_OTP"; email: string }
    | { status: "RESET_PASSWORD"; email: string; otp: string }
  >({ status: "REQUEST_OTP" });
</script>

<Card.Root class="w-1/3">
  <Card.Header>
    {#if submission.status === "REQUEST_OTP"}
      <Card.Title id="password" class="text-xl">Password reset link sent</Card.Title>
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
  </Card.Content>
</Card.Root>
