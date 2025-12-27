import { error, redirect } from "@sveltejs/kit";
import { APIError } from "better-auth";
import { auth } from "$lib/auth";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, request }) => {
  const { invitationId } = params;

  if (!invitationId) {
    return error(400, { message: "BAD_REQUEST" });
  }

  try {
    const result = await auth.api.acceptInvitation({
      body: { invitationId },
      headers: request.headers,
    });

    return { invitedOrganizationId: result?.invitation.organizationId };
  } catch (e) {
    if (e instanceof APIError) {
      return error(e.statusCode, { message: e.message });
    }

    return error(500, { message: "INTERNAL_SERVER_ERROR" });
  }
};
