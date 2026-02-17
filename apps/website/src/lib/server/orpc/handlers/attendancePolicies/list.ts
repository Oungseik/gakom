import { asc, attendancePolicy, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.number().optional(),
  pageSize: z.number(),
  slug: z.string(),
});

export const listAttendancePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    const items = await db
      .select({
        id: attendancePolicy.id,
        name: attendancePolicy.name,
        timezone: attendancePolicy.timezone,
        clockIn: attendancePolicy.clockInSec,
        clockOut: attendancePolicy.clockOutSec,
        gracePeriod: attendancePolicy.gracePeriodSec,
        workdays: attendancePolicy.workdays,
        offset: attendancePolicy.timezone,
        updatedAt: attendancePolicy.updatedAt,
      })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.organizationId, context.organization.id))
      .orderBy(asc(attendancePolicy.createdAt))
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
