import { and, desc, eq, leavePolicy, like, organization } from "@repo/db";
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
        id: leavePolicy.id,
        name: leavePolicy.name,
        days: leavePolicy.days,
        createdAt: leavePolicy.createdAt,
        updatedAt: leavePolicy.updatedAt,
      })
      .from(leavePolicy)
      .innerJoin(organization, eq(leavePolicy.organizationId, organization.id))
      .where(
        and(
          eq(organization.id, context.organization.id),
          filter?.search ? like(leavePolicy.name, `%${filter.search}%`) : undefined,
        ),
      )
      .orderBy(desc(leavePolicy.createdAt))
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
