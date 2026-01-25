import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { user } = await parent();

  const organizations = await db.query.organization.findMany({
    where: { slug: params.slug, members: { userId: user.id } },
  });

  const organization = organizations.find((o) => o.slug === params.slug);
  if (!organization) {
    return error(404);
  }

  const member = await db.query.member.findFirst({
    where: { organizationId: organization.id, userId: user.id },
    columns: { role: true },
  });

  if (!member?.role || member.role === "MEMBER") {
    error(403);
  }

  return {
    organization,
    organizations,
  };
};
