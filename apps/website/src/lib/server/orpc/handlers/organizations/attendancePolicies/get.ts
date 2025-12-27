import { and, attendancePolicy, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const getAttendancePolicyHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["owner", "admin", "member"]))
  .handler(async ({ context, input, errors }) => {
    const item = await db
      .select({
        id: attendancePolicy.id,
        name: attendancePolicy.name,
        timezone: attendancePolicy.timezone,
        clockIn: attendancePolicy.clockInSec,
        clockOut: attendancePolicy.clockOutSec,
        workdays: attendancePolicy.workDays,
        organizationId: attendancePolicy.organizationId,
        createdAt: attendancePolicy.createdAt,
        updatedAt: attendancePolicy.updatedAt,
      })
      .from(attendancePolicy)
      .where(
        and(
          eq(attendancePolicy.id, input.id),
          eq(attendancePolicy.organizationId, context.organization.id),
        ),
      );

    if (!item) {
      throw errors.NOT_FOUND();
    }

    return { item };
  });
