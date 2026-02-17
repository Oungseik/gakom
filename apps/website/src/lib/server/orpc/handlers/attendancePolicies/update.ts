import { and, attendancePolicy, eq } from "@repo/db";
import { TIMEZONES } from "@repo/db/timezone";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  id: z.string(),
  slug: z.string(),
  data: z.object({
    name: z.string(),
    timezone: z.enum(TIMEZONES),
    clockIn: z.number(),
    clockOut: z.number(),
    gracePeriod: z.number(),
    workdays: z.array(z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"])),
  }),
});

export const updateAttendancePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    await db
      .update(attendancePolicy)
      .set({
        ...input.data,
        clockInSec: input.data.clockIn,
        clockOutSec: input.data.clockOut,
        gracePeriodSec: input.data.gracePeriod,
      })
      .where(
        and(
          eq(attendancePolicy.id, input.id),
          eq(attendancePolicy.organizationId, context.organization.id),
        ),
      );
  });
