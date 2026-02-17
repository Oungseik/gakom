import { attendancePolicy } from "@repo/db";
import { TIMEZONES } from "@repo/db/timezone";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
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

export const createAttendancePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    await db.insert(attendancePolicy).values({
      ...input.data,
      clockInSec: input.data.clockIn,
      clockOutSec: input.data.clockOut,
      gracePeriodSec: input.data.gracePeriod,
      organizationId: context.organization.id,
    });
  });
