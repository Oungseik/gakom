import {
  and,
  attendance,
  attendancePolicy,
  desc,
  eq,
  gte,
  inArray,
  lte,
  like,
  member,
  or,
  organization,
  user,
} from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  cursor: z.number().optional(),
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
    })
    .optional(),
});

export const listHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ input, context }) => {
    const limit = input.pageSize + 1;
    const filter = input.filter;


    const items = await db
      .select({
        id: attendance.id,
        date: attendance.date,
        checkInAt: attendance.checkInAt,
        checkOutAt: attendance.checkOutAt,
        checkInLocation: attendance.checkInLocation,
        checkOutLocation: attendance.checkOutLocation,
        workedSeconds: attendance.workedSeconds,
        status: attendance.status,
        updatedAt: attendance.updatedAt,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        policy: {
          id: attendancePolicy.id,
          name: attendancePolicy.name,
          timezone: attendancePolicy.timezone,
          clockInSec: attendancePolicy.clockInSec,
          clockOutSec: attendancePolicy.clockOutSec,
        },
      })
      .from(attendance)
      .innerJoin(user, eq(attendance.userId, user.id))
      .innerJoin(attendancePolicy, eq(attendance.attendancePolicyId, attendancePolicy.id))
      .innerJoin(member, eq(attendance.userId, member.userId))
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        and(
          eq(organization.id, context.organization.id),
          filter?.status ? inArray(attendance.status, filter.status) : undefined,
          filter?.search
            ? or(like(user.name, `%${filter.search}%`), like(user.email, `%${filter.search}%`))
            : undefined,
          filter?.dateFrom ? gte(attendance.date, filter.dateFrom) : undefined,
          filter?.dateTo ? lte(attendance.date, filter.dateTo) : undefined,
        ),
      )
      .orderBy(desc(attendance.date), desc(attendance.checkInAt))
      .limit(limit);

    let nextCursor: number | undefined;
    if (items.length > input.pageSize) {
      const nextItem = items.pop();
      if (nextItem?.checkInAt) {
        nextCursor = nextItem.checkInAt.getTime();
      }
    }

    return {
      items,
      nextCursor,
      pageSize: input.pageSize,
    };
  });
