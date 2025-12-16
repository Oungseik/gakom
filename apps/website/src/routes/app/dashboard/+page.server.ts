import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { organizations, session } = await parent();

  const slug =
    organizations.find((o) => o.id === session.activeOrganizationId)?.slug ??
    organizations.at(0)?.slug;

  redirect(303, `/app/dashboard/${slug}`);
};
