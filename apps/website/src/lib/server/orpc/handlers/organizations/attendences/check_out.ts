import { ORPCError } from "@orpc/server";
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

export const checkOutHandler = os
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
      .select({
        timezone: attendancePolicy.timezone,
        clockInSec: attendancePolicy.clockInSec,
        clockOutSec: attendancePolicy.clockOutSec,
      })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.id, memberRecord.attendancePolicyId));

    if (!policy) {
      throw new ORPCError("NOT_FOUND", { message: "Attendance policy not found" });
    }

    const dateFormatterOptions: Intl.DateTimeFormatOptions = {
      timeZone: policy.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const dateFormatter = new Intl.DateTimeFormat("en-CA", dateFormatterOptions);
    const dateInTimezone = dateFormatter.format(now);

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

    if (currentSeconds >= 86400) {
      throw new ORPCError("FORBIDDEN", { message: "Cannot check out after midnight" });
    }

    const [existingRecord] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.memberId, memberRecord.id), eq(attendance.date, dateInTimezone)));

    if (!existingRecord) {
      throw new ORPCError("FORBIDDEN", { message: "No check-in record found for today" });
    }

    if (!existingRecord.checkInAt) {
      throw new ORPCError("FORBIDDEN", { message: "Check-in time not found" });
    }

    const workedSeconds = Math.floor((now.getTime() - existingRecord.checkInAt.getTime()) / 1000);
    const isEarlyLeave = currentSeconds < policy.clockOutSec;

    let status: "PRESENT" | "LATE" | "EARLY_LEAVE";
    if (existingRecord.status === "LATE") {
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
