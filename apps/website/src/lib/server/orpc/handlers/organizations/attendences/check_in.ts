import { attendance } from "@repo/db";
import z from "zod";
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
    await db.insert(attendance).values({
      userId: context.session.user.id,
      type: "CHECK_IN",
      attendancePolicyId: input.attendancePolicyId,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
    });
  });
