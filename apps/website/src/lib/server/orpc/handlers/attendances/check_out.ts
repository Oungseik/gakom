import { ORPCError } from "@orpc/server";
import { attendance, eq } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";
import { getDateInTimezone, getTimeInTimezone } from "$lib/utils";

const input = z.object({
  slug: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
});

export const checkOutHandler = os
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input }) => {
    if (!context.member.attendancePolicyId) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Contact admin to request to assign the check-in check-out time.",
      });
    }

    const policy = (await db.query.attendancePolicy.findFirst({
      where: { id: context.member.attendancePolicyId },
    }))!;

    const now = new Date();
    const currentDateInTimezone = getDateInTimezone(policy.timezone, now);

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

    const existingRecord = attendances.at(0);
    if (!existingRecord) {
      throw new ORPCError("FORBIDDEN", { message: "No check-in record found for today" });
    }

    // Assume check in always exist at this point
    const checkIn = existingRecord.checkInAt!;

    const time = getTimeInTimezone(policy.timezone, now);
    const [hours, minutes] = time.split(":").map(Number);
    const currentSeconds = hours * 3600 + minutes * 60;
    const isEarlyLeave = currentSeconds < policy.clockOutSec;
    const isLateCheckOut = currentSeconds > policy.clockOutSec;
    const workedSeconds = Math.floor((now.getTime() - checkIn.getTime()) / 1000);

    const isLateCheckIn = existingRecord.status === "LATE";

    let status: "PRESENT" | "LATE" | "EARLY_LEAVE";
    if (isLateCheckIn || isLateCheckOut) {
      status = "LATE";
    } else if (isEarlyLeave) {
      status = "EARLY_LEAVE";
    } else {
      status = "PRESENT";
    }

    await db
      .update(attendance)
      .set({
        checkOutAt: now,
        checkOutLocation: {
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
        },
        workedSeconds,
        status,
        updatedAt: now,
      })
      .where(eq(attendance.id, existingRecord.id));
  });
