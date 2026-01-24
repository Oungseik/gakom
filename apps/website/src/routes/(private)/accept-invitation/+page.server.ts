import { call, ORPCError } from "@orpc/server";
import { error } from "@sveltejs/kit";
import { acceptInvitationHandler } from "$lib/server/orpc/handlers/organizations/invitations/accept";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return error(400);
  }

  try {
    const { slug } = await call(
      acceptInvitationHandler,
      { token },
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
