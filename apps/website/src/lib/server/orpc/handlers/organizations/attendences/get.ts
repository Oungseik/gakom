import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getDateInTimezone } from "$lib/utils";

const input = z.object({
  slug: z.string(),
});

export const getAttendanceHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context }) => {
    // policy will always exist since it was already checked by the middleware
    const policy = (await db.query.attendancePolicy.findFirst({
      where: { id: context.attendancePolicy.id },
    }))!;

    const currentDate = new Date();
    const currentDateInTimezone = getDateInTimezone(policy.timezone, currentDate);

    // use `findMany` because `findFirst` will fail when do relation at this moment
    const attendances = await db.query.attendance.findMany({
      where: {
        memberId: context.member.id,
        date: currentDateInTimezone,
        organizationId: context.organization.id,
      },
      with: { attendancePolicy: true },
      limit: 1,
    });

    const attendance = attendances.at(0);
    if (!attendance || !attendance.attendancePolicy) {
      return { attendance: null };
    }

    return {
      attendance: {
        timezone: attendance.attendancePolicy.timezone,
        status: attendance.status,
        checkInAt: attendance.checkInAt,
        checkOutAt: attendance.checkOutAt,
        clockInSec: attendance.attendancePolicy.clockInSec,
        clockOutSec: attendance.attendancePolicy.clockOutSec,
      },
    };
  });
