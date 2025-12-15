import { error, redirect } from "@sveltejs/kit";
import { auth } from "$lib/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, request }) => {
  if (!locals.session) {
    return error(403, "/signup");
  }

  const orgs = await auth.api.listOrganizations({ headers: request.headers });
  if (orgs.length < 1) {
    return redirect(303, "/setup");
  }

  return { user: locals.session.user, session: locals.session.session };
};
