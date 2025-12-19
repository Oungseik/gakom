import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, url, request }) => {
  const session = locals.session?.session;
  const user = locals.session?.user;
  const pathname = url.pathname;
  const isEmailVerified = user?.emailVerified;

  if (["/signin", "/signup"].includes(pathname)) {
    if (!session) {
      return;
    }

    if (!isEmailVerified) {
      return redirect(303, "/verify-account");
    }

    const organizations = await auth.api.listOrganizations({ headers: request.headers });
    if (organizations.length === 0) {
      return redirect(303, "/setup");
    }

    return redirect(303, url.searchParams.get("return_url") ?? "/app");
  }

  if (pathname === "/verify-account") {
    if (!session) {
      return redirect(303, "/signin");
    }

    if (!isEmailVerified) {
      return;
    }

    const organizations = await auth.api.listOrganizations({ headers: request.headers });
    if (organizations.length === 0) {
      return redirect(303, "/setup");
    }
  }

  if (pathname === "/setup") {
    if (!session) {
      return redirect(303, "/signin");
    }

    const organizations = await auth.api.listOrganizations({ headers: request.headers });
    if (organizations.length === 0) {
      return;
    }
    return redirect(303, url.searchParams.get("return_url") ?? "/app");
  }

  return {
    session: locals.session?.session,
    user: locals.session?.user,
  };
};
