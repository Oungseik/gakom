import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.string().optional(),
  pageSize: z.number(),
  slug: z.string(),
});

export const listCalendarsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    const items = await db.query.calendar.findMany({
      where: { id: { gte: input.cursor }, organizationId: context.organization.id },
      orderBy: { id: "asc" },
      limit: input.pageSize + 1,
    });

    let nextCursor: string | undefined;

    if (items.length > input.pageSize) {
      const next = items.pop();
      nextCursor = next?.id;
    }

    return { items, pageSize: input.pageSize, nextCursor };
  });
