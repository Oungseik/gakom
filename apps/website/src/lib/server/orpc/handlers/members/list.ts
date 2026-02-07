import { and, asc, desc, eq, ilike, isNull, like, member, or, organization, user } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.number().optional(),
  pageSize: z.number(),
  slug: z.string(),
  filter: z
    .object({
      search: z.string().optional(),
      role: z.string().optional(),
      ordering: z.enum(["ASC", "DESC"]).optional(),
    })
    .optional(),
});

export const listMembersHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input }) => {
    const search = input.filter?.search;
    const condition = and(
      eq(organization.slug, input.slug),
      search
        ? or(
            ilike(user.email, `%${search}%`),
            ilike(user.name, `%${search}%`),
            ilike(member.position, `%${search}%`),
          )
        : undefined,
      input.filter?.role ? like(member.role, input.filter.role) : undefined,
      isNull(member.leftAt),
    );

    const items = await db
      .select({
        id: member.id,
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
      .orderBy(input.filter?.ordering === "ASC" ? asc(member.createdAt) : desc(member.createdAt))
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
