import { ORPCError } from "@orpc/client";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getDateInTimezone } from "$lib/utils";

const input = z.object({
  slug: z.string(),
});

/**
 * Get attendance of the current day for the signed-in user
 * */
export const getAttendanceHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context }) => {
    if (!context.member.attendancePolicyId) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Contact admin to request to assign the check-in check-out time.",
      });
    }

    const policy = await db.query.attendancePolicy.findFirst({
      where: { id: context.member.attendancePolicyId },
    });

    if (!policy) {
      throw new ORPCError("NOT_FOUND", { message: "Leave policy not found." });
    }

    const currentDate = new Date();
    const currentDateInTimezone = getDateInTimezone(policy.timezone, currentDate);

    const attendance = await db.query.attendance.findFirst({
      where: {
        memberId: context.member.id,
        date: currentDateInTimezone,
        organizationId: context.organization.id,
      },
      with: { attendancePolicy: true },
    });

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
