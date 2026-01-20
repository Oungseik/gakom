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
  .use(organizationMiddleware(["admin", "member", "owner"]))
  .handler(async ({ context, input }) => {
    const policy = (await db.query.attendancePolicy.findFirst({
      where: { id: context.attendancePolicy.id },
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
    const seconds = hours * 3600 + minutes * 60;
    const isEarlyLeave = seconds < policy.clockOutSec;
    const workedSeconds = Math.floor((now.getTime() - checkIn.getTime()) / 1000);

    const status =
      existingRecord.status === "LATE" ? "LATE" : isEarlyLeave ? "EARLY_LEAVE" : "PRESENT";

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
