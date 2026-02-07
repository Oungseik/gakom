import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { auth } from "$lib/auth";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { client } from "$lib/server/orpc/router";
import { rateLimiter } from "$lib/server/rate-limit";

globalThis.$client = client;

const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;

    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace("%paraglide.lang%", locale),
    });
  });

const rateLimitHandle: Handle = async ({ event, resolve }) => {
  const clientIP = event.request.headers.get("X-Forwarded-For");
  if (clientIP === null) {
    return resolve(event);
  }

  const cost = event.request.method === "GET" || event.request.method === "OPTIONS" ? 1 : 2;
  try {
    await rateLimiter.consume(clientIP, cost);
  } catch (error) {
    return new Response("Too many requests", { status: 429 });
  }

  return resolve(event);
};

const authHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/api/auth")) {
    return svelteKitHandler({ event, resolve, auth, building });
  }

  const session = await auth.api.getSession({ headers: event.request.headers });
  event.locals.session = session;

  return resolve(event);
};

export const handle: Handle = sequence(rateLimitHandle, handleParaglide, authHandle);
