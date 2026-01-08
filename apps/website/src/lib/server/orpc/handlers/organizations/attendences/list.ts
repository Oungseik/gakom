import { attendance, attendancePolicy, desc, eq, member, organization, user } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  cursor: z.number().optional(),
  pageSize: z.number().optional().default(10),
});

export const listHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ input, context }) => {
    const limit = input.pageSize + 1;

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
      .where(eq(organization.id, context.organization.id))
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
