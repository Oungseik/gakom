import {
  emailOTPClient,
  inferOrgAdditionalFields,
  organizationClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";
import type { Auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      teams: { enabled: true },
      schema: inferOrgAdditionalFields<Auth>(),
    }),
    twoFactorClient(),
    emailOTPClient(),
  ],
});
