import { ORPCError } from "@orpc/client";
import { and, attendance, attendancePolicy, eq, member } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number(),
});

export const checkInHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "member", "owner"]))
  .handler(async ({ context, input }) => {
    const now = new Date();

    const [memberRecord] = await db
      .select({
        id: member.id,
        attendancePolicyId: member.attendancePolicyId,
      })
      .from(member)
      .where(
        and(
          eq(member.userId, context.session.user.id),
          eq(member.organizationId, context.organization.id),
          eq(member.status, "ACTIVE"),
        ),
      );

    if (!memberRecord) {
      throw new ORPCError("NOT_FOUND", { message: "Member record not found" });
    }

    if (!memberRecord.attendancePolicyId) {
      throw new ORPCError("FORBIDDEN", { message: "No attendance policy assigned" });
    }

    const [policy] = await db
      .select({ timezone: attendancePolicy.timezone })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.id, memberRecord.attendancePolicyId));

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
      .where(and(eq(attendance.memberId, memberRecord.id), eq(attendance.date, dateInTimezone)));

    if (existingAttendance.length > 0) {
      throw new ORPCError("FORBIDDEN", { message: "Already checked in for today" });
    }

    const timeFormatterOptions: Intl.DateTimeFormatOptions = {
      timeZone: policy.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const timeFormatter = new Intl.DateTimeFormat("en-US", timeFormatterOptions);
    const formattedTime = timeFormatter.format(now);
    const [hours, minutes] = formattedTime.split(":").map(Number);
    const currentSeconds = hours * 3600 + minutes * 60;

    const [policyWithTimes] = await db
      .select({
        clockInSec: attendancePolicy.clockInSec,
        clockOutSec: attendancePolicy.clockOutSec,
      })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.id, memberRecord.attendancePolicyId));

    const isLate = currentSeconds > policyWithTimes.clockInSec;

    await db.insert(attendance).values({
      userId: context.session.user.id,
      memberId: memberRecord.id,
      organizationId: context.organization.id,
      attendancePolicyId: memberRecord.attendancePolicyId,
      date: dateInTimezone,
      checkInAt: now,
      checkInLocation: {
        latitude: input.latitude,
        longitude: input.longitude,
        accuracy: input.accuracy,
      },
      status: isLate ? "LATE" : "INCOMPLETE",
      workedSeconds: 0,
      updatedAt: now,
    });
  });
