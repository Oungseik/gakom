import { and, eq, member, organization } from "@repo/db";
import { error, type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { auth } from "$lib/auth";
import { paraglideMiddleware } from "$lib/paraglide/server";
import { db } from "$lib/server/db";
import { client } from "$lib/server/orpc/router";
import { rateLimiter } from "$lib/server/rate-limit";
import { PROTECTED_PATHS } from "$lib/utils";

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

  const { pathname } = event.url;
  const isEmailVerified = session?.user.emailVerified;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  // `/rpc` route is unprotected and let the authentication in oRPC routes handle by oRPC itself
  if (!isProtected) {
    return resolve(event);
  }

  if (!session) {
    return redirect(303, `/signin?return_url=${pathname}`);
  }

  if (!isEmailVerified) {
    return redirect(303, "/verify-account");
  }

  // pass the access dashboard with no organization, and let the +layout.server.ts handle the error
  const slug = pathname.split("/").at(2);
  if (!slug || pathname.startsWith("/account")) {
    return resolve(event);
  }

  const organizations = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      role: member.role,
      joinedAt: member.createdAt,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(and(eq(member.userId, session.user.id), eq(member.status, "ACTIVE")));

  event.locals.organizations = organizations;

  const role = organizations.find((org) => org.slug === slug)?.role;
  if (pathname.startsWith("/dashboard") && role === "MEMBER") {
    return error(403, {
      message: "You don't have enough permission to the organization dashboard.",
    });
  }

  if (!role) {
    return error(403, { message: "You don't have enough permission to access this organization." });
  }

  return resolve(event);
};

export const handle: Handle = sequence(rateLimitHandle, handleParaglide, authHandle);
