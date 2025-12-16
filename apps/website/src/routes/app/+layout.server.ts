import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url, request }) => {
  if (!locals.session) {
    return redirect(303, `/signin?return_url=${url.pathname}`);
  }

  const orgs = await auth.api.listOrganizations({ headers: request.headers });
  if (orgs.length < 1 && url.pathname.startsWith("/app/dashboard")) {
    return redirect(303, "/app/setup");
  }

  return {
    user: locals.session.user,
    session: locals.session.session,
    organizations: orgs.map((o) => ({
      logo: o.logo as string,
      slug: o.slug,
      name: o.name,
      id: o.id,
    })),
  };
};
