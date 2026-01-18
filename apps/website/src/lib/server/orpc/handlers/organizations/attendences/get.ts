import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const getAttendanceHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context }) => {
    const attendances = await db.query.attendance.findMany({
      where: { memberId: context.member.id },
      with: { attendancePolicy: true },
      limit: 1,
    });

    const attendance = attendances.at(0);
    if (!attendance || !attendance.attendancePolicy) {
      return { attendance: null };
    }

    // Calculate the current date in the attendance policy's timezone
    const timezone = attendance.attendancePolicy.timezone;
    const currentDate = new Date();
    const currentDateInTimezone = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(currentDate);

    // Check if the attendance is from the current day in the policy's timezone
    if (attendance.date !== currentDateInTimezone) {
      return { attendance: null };
    }

    return {
      attendance: {
        timezone: attendance.attendancePolicy.timezone,
        status: attendance.status,
        checkInAt: attendance.checkInAt,
        checkOutAt: attendance.checkOutAt,
      },
    };
  });
