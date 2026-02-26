import { db } from "$lib/server/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const leave = await db.query.leavePolicy.findMany({
    where: { organization: { slug: params.slug } },
    columns: { name: true, id: true },
  });

  return { leave };
};
