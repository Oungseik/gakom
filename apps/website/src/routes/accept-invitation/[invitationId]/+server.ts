import type { RequestHandler } from "@sveltejs/kit";
import { APIError } from "better-auth";
import { auth } from "$lib/auth";

const handle: RequestHandler = async ({ params, request }) => {
  const { invitationId } = params;

  if (!invitationId) {
    return new Response("BAD_REQUEST", { status: 400 });
  }

  try {
    await auth.api.acceptInvitation({
      body: { invitationId },
      headers: request.headers,
    });
    return new Response("OK", { status: 200 });
  } catch (e) {
    if (e instanceof APIError) {
      return new Response(e.status.toString(), { status: e.statusCode });
    }

    return new Response("INTERNAL_SERVER_ERROR", { status: 500 });
  }
};

export const GET = handle;
