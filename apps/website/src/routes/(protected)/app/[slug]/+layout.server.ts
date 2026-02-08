import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { isNotNull } from "$lib/utils";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ parent, params }) => {
  const { user } = await parent();

  const u = await db.query.user.findFirst({
    where: { id: user.id },
    with: {
      members: {
        with: { organization: true, attendancePolicy: true, calendar: true },
        columns: { role: true, calendarId: true },
      },
    },
  });

  const organizations = u?.members.map((m) => m.organization).filter(isNotNull) ?? [];
  const organization = organizations.find((o) => o?.slug === params.slug);
  if (!organization) {
    return error(404);
  }

  const member = u?.members.find((m) => m.organization?.id === organization.id);

  return {
    organization,
    member,
  };
};
