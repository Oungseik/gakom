import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.session) {
    return redirect(303, "/signup".concat(url.search));
  }
};
