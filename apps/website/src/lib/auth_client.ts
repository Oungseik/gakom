import { emailOTPClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
  plugins: [organizationClient({ teams: { enabled: true } }), twoFactorClient(), emailOTPClient()],
});
