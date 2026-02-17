import { ORPCError } from "@orpc/server";
import { attendance } from "@repo/db";
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

export const checkInHandler = os
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

    const time = getTimeInTimezone(policy.timezone, now);
    const [hours, minutes] = time.split(":").map(Number);
    const currentSeconds = hours * 3600 + minutes * 60;
    const isLate = currentSeconds > policy.clockInSec + policy.gracePeriodSec;
    const initialStatus = isLate ? "LATE" : "PRESENT";

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

    const attendanceRecord = attendances.at(0);
    if (attendanceRecord) {
      throw new ORPCError("FORBIDDEN", { message: "Already checked in for today" });
    }

    await db.insert(attendance).values({
      userId: context.session.user.id,
      memberId: context.member.id,
      organizationId: context.organization.id,
      attendancePolicyId: policy.id,
      date: currentDateInTimezone,
      checkInAt: now,
      checkInLocation: {
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      },
      status: initialStatus,
      workedSeconds: 0,
      updatedAt: now,
    });
  });
