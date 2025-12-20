import { and, desc, eq, isNotNull, isNull, member, organization, user } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.number().optional(),
  pageSize: z.number(),
  slug: z.string(),
  filter: z.object({ type: z.enum(["all", "active", "inactive"]).default("active") }).optional(),
});

export const listMembersHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ input }) => {
    const condition = and(
      input.filter?.type === "active"
        ? isNull(member.leftAt)
        : input.filter?.type === "inactive"
          ? isNotNull(member.leftAt)
          : undefined,
      eq(organization.slug, input.slug),
    );

    const items = await db
      .select({
        userId: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        address: user.address,
        city: user.city,
        countryCode: user.countryCode,
        position: member.position,
        role: member.role,
        joinedAt: member.createdAt,
        leftAt: member.leftAt,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(condition)
      .orderBy(desc(member.createdAt))
      .offset(input.cursor ?? 0)
      .limit(input.pageSize + 1);

    let nextCursor: typeof input.cursor;
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
