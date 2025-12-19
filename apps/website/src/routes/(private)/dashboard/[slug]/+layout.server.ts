import { error } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { organizations } = await parent();

  const currentOrganization = organizations.find((o) => o.slug === params.slug);

  if (!currentOrganization) {
    return error(404);
  }

  return {
    currentOrganization,
    organizations: organizations?.filter((o) => o.role !== "member"),
  };
};
