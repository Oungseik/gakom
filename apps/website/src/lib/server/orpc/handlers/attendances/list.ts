import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  cursor: z.string().optional(),
  pageSize: z.number().optional().default(10),
  filter: z
    .object({
      search: z.string().optional(),
      status: z
        .array(z.enum(["PRESENT", "LATE", "EARLY_LEAVE", "ABSENT", "INCOMPLETE"]))
        .optional(),
      dateFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      dateTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, {
          message: "Date must be in YYYY-MM-DD format",
        })
        .optional(),
      self: z.boolean().default(false),
    })
    .optional(),
});

export const listAttendancesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ input, context }) => {
    const filter = input.filter;

    const items = await db.query.attendance.findMany({
      where: {
        id: { lte: input.cursor },
        attendancePolicy: { organizationId: context.organization.id },
        status: { in: filter?.status?.length ? filter.status : undefined },
        date: { gte: filter?.dateFrom, lte: filter?.dateTo },
        userId:
          context.member.role === "MEMBER" || input.filter?.self
            ? context.session.user.id
            : undefined,
        ...(filter?.search && {
          OR: [
            { user: { name: { ilike: `%${filter.search}%` } } },
            { user: { email: { ilike: `%${filter.search}%` } } },
          ],
        }),
      },
      with: { user: true, attendancePolicy: true },
      orderBy: { id: "desc" },
      limit: input.pageSize + 1,
    });

    let nextCursor: string | undefined;

    if (items.length > input.pageSize) {
      const next = items.pop();
      nextCursor = next?.id;
    }

    return {
      items: items.map((item) => ({
        ...item,
        attendancePolicy: item.attendancePolicy!,
        user: item.user!,
      })),
      pageSize: input.pageSize,
      nextCursor,
    };
  });
