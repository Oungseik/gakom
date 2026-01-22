import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { organizations, user } = await parent();
  const currentOrganization = organizations?.find((o) => o.slug === params.slug);

  if (!currentOrganization) {
    return error(404);
  }

  const member = await db.query.member.findFirst({
    where: { organizationId: currentOrganization.id, userId: user.id },
    columns: { role: true },
    with: { attendancePolicy: true },
  });

  return {
    currentOrganization,
    member: {
      role: member?.role ?? "member",
      attendancePolicy: member?.attendancePolicy,
    },
  };
};
