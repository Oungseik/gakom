import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization, twoFactor } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";

import { getRequestEvent } from "$app/server";
import { AUTH_SECRET } from "$env/static/private";

import { db } from "./server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  appName: "EzOrg",
  secret: AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }) => {
      // TODO: Implement email sending for password reset
      console.log(`Password reset for ${user.email}: ${url}`);
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      // TODO: Implement email sending for verification
      console.log(`Verification for ${user.email}: ${url}`);
    },
  },

  plugins: [
    organization({ teams: { enabled: true } }),
    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        // TODO: Implement email sending for email otp
      },
    }),
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          // TODO: Implement OTP sending
          console.log(`OTP for ${user.email}: ${otp}`);
        },
      },
    }),
    sveltekitCookies(getRequestEvent),
  ],
});
