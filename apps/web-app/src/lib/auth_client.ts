import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";
import {PUBLIC_BETTER_AUTH_BASE_URL} from "$env/static/public";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});
