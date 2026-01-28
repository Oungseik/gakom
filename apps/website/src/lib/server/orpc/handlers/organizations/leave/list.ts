import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const listLeavePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ context }) => {
    const items = await db.query.leave.findMany({
      where: { organizationId: context.organization.id, status: "ENABLED" },
    });

    return { items };
  });
