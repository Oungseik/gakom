import { asc, attendancePolicy, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.string().optional(),
  pageSize: z.number(),
  slug: z.string(),
});

export const listAttendancePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    const items = await db.query.attendancePolicy.findMany({
      where: { organizationId: context.organization.id, id: { gte: input.cursor } },
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
