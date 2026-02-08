import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const calendar = await db.query.calendar.findFirst({
    where: { id: params.calendarId, organization: { slug: params.slug } },
  });

  if (!calendar) {
    return error(404);
  }

  return { calendar };
};
