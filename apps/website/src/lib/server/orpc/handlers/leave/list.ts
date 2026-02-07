import { and, desc, eq, leave, like, organization } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  cursor: z.number().optional(),
  pageSize: z.number().optional().default(10),
  filter: z
    .object({
      search: z.string().optional(),
    })
    .optional(),
});

export const listLeavePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ input, context }) => {
    const filter = input.filter;
    const limit = input.pageSize + 1;

    const items = await db
      .select({
        id: leave.id,
        name: leave.name,
        days: leave.days,
        createdAt: leave.createdAt,
        updatedAt: leave.updatedAt,
      })
      .from(leave)
      .innerJoin(organization, eq(leave.organizationId, organization.id))
      .where(
        and(
          eq(organization.id, context.organization.id),
          filter?.search ? like(leave.name, `%${filter.search}%`) : undefined,
        ),
      )
      .orderBy(desc(leave.createdAt))
      .offset(input.cursor ?? 0)
      .limit(limit);

    let nextCursor: number | undefined;
    if (items.length > input.pageSize) {
      items.pop();
      nextCursor = (input.cursor ?? 0) + input.pageSize;
    }

    return {
      items,
      nextCursor,
      pageSize: input.pageSize,
    };
  });
