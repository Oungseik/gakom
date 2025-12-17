import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  if (locals.session?.user.emailVerified) {
    return redirect(303, "/app/dashboard");
  }

  return {
    session: locals.session?.session,
    user: locals.session?.user,
  };
};
