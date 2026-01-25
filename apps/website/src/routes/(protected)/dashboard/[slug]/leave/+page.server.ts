import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  // leave types
  const leave = await db.query.leave.findMany({
    where: { organization: { slug: params.slug } },
    columns: { name: true, id: true },
  });

  return { leave };
};
