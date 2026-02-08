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
      role: z.enum(["ADMIN", "OWNER", "MEMBER"]).optional(),
    })
    .optional(),
});

export const listMembersHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input }) => {
    const search = input.filter?.search;

    const members = await db.query.member.findMany({
      where: {
        organization: { slug: input.slug },
        role: input.filter?.role,
        leftAt: { isNull: true },
        OR: [
          { ...(search && { position: `%${search}%` }) },
          { ...(search && { user: { email: { ilike: `%${search}%` } } }) },
          { ...(search && { user: { name: { ilike: `%${search}%` } } }) },
        ],
      },
      with: { leaveToMembers: true, user: true, attendancePolicy: true },
      orderBy: { createdAt: "asc" },
      offset: input.cursor ?? 0,
      limit: input.pageSize + 1,
    });

    let nextCursor: typeof input.cursor;
    if (members.length > input.pageSize) {
      members.pop();
      nextCursor = (input.cursor ?? 0) + input.pageSize;
    }

    return {
      items: members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        address: m.user.address,
        city: m.user.city,
        countryCode: m.user.countryCode,
        position: m.position,
        role: m.role,
        joinedAt: m.createdAt,
        leftAt: m.leftAt,
        attendancePolicy: m.attendancePolicy,
        calendarId: m.calendarId,
        leaveIds: m.leaveToMembers.map((l) => l.leaveId),
      })),
      nextCursor,
      pageSize: input.pageSize,
    };
  });
