import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

// TODO support infinite query
export const listLeavePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ context }) => {
    const items = await db.query.leave.findMany({
      where: { organizationId: context.organization.id },
    });

    return { items };
  });
