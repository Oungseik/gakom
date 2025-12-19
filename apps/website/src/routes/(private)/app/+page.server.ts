import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
  const { organizations } = await parent();
  const slug = organizations.at(0)?.slug;

  redirect(303, slug ? `/app/${slug}` : "/setup");
};
