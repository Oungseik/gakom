import { call, ORPCError } from "@orpc/server";
import { error } from "@sveltejs/kit";
import { acceptInvitationHandler } from "$lib/server/orpc/handlers/organizations/invitations/accept";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  try {
    const { slug } = await call(
      acceptInvitationHandler,
      { token: params.token },
      { context: { session: locals.session } },
    );
    return { slug };
  } catch (err) {
    if (err instanceof ORPCError) {
      return error(err.status, { message: err.message });
    }

    return error(500);
  }
};
