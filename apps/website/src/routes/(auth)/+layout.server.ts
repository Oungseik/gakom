import { redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const session = locals.session?.session;
  const user = locals.session?.user;
  const pathname = url.pathname;
  const isEmailVerified = user?.emailVerified;

  if (["/signin", "/signup"].some((prefix) => pathname.startsWith(prefix)) && !session) {
    return;
  }

  if (!session) {
    return redirect(303, "/signin");
  }

  if (pathname.startsWith("/forgot-password")) {
    return { session, user };
  }

  if (!isEmailVerified && pathname.startsWith("/verify-account")) {
    return { session, user };
  }

  if (!isEmailVerified) {
    return redirect(303, "/verify-account");
  }

  const organizations = await db.query.organization.findMany({
    where: { members: { user: { email: user?.email, members: { status: "ACTIVE" } } } },
  });

  if (organizations.length === 0 && pathname === "/setup") {
    return;
  }

  if (organizations.length === 0) {
    return redirect(303, "/setup");
  }

  return redirect(303, url.searchParams.get("return_url") ?? `/app/${organizations.at(0)?.slug}`);
};
