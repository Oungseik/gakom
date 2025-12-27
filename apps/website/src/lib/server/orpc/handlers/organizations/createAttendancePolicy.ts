import { attendancePolicy } from "@repo/db";
import { TIMEZONE } from "@repo/db/timezone";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  data: z.object({
    name: z.string(),
    enabled: z.boolean(),
    timezone: z.enum(TIMEZONE),
    clockIn: z.number(),
    clockOut: z.number(),
    workdays: z.array(z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"])),
  }),
});

export const createAttendancePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ context, input }) => {
    await db.insert(attendancePolicy).values({
      ...input.data,
      clockInSec: input.data.clockIn,
      clockOutSec: input.data.clockOut,
      organizationId: context.organization.id,
    });
  });
