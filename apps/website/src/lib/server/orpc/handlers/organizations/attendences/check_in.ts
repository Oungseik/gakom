import { ORPCError } from "@orpc/client";
import { and, attendance, attendancePolicy, eq } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  attendancePolicyId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
});

export const checkInHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "member", "owner"]))
  .handler(async ({ context, input }) => {
    const now = new Date();

    const [policy] = await db
      .select({ timezone: attendancePolicy.timezone })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.id, input.attendancePolicyId));

    if (!policy) {
      throw new ORPCError("NOT_FOUND", { message: "Attendance policy not found" });
    }

    const options: Intl.DateTimeFormatOptions = {
      timeZone: policy.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("en-CA", options);
    const dateInTimezone = formatter.format(now);

    const existingAttendance = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, context.session.user.id),
          eq(attendance.attendancePolicyId, input.attendancePolicyId),
          eq(attendance.date, dateInTimezone),
        ),
      );

    if (existingAttendance.length > 0) {
      throw new ORPCError("FORBIDDEN", { message: "Already checked in for today" });
    }

    await db.insert(attendance).values({
      userId: context.session.user.id,
      organizationId: context.organization.id,
      attendancePolicyId: input.attendancePolicyId,
      date: dateInTimezone,
      checkInAt: now,
      checkInLocation: {
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      },
      status: "INCOMPLETE",
      workedSeconds: 0,
      updatedAt: now,
    });
  });
