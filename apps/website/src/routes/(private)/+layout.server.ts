import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  if (!locals.session) {
    return redirect(303, `/signin?return_url=${url.pathname}`);
  }

  const organizations = locals.organizations;
  if (!organizations || organizations.length < 1) {
    return redirect(303, "/setup");
  }

  return {
    user: locals.session.user,
    session: locals.session.session,
    organizations,
  };
};
