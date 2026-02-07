import { and, attendancePolicy, count, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";

import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  id: z.string(),
  slug: z.string(),
});

export const deleteAttendancePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input, errors }) => {
    const ap = await db
      .select({ count: count() })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.organizationId, context.organization.id));

    const policiesCount = ap.at(0)?.count;
    if (!policiesCount) {
      throw errors.INTERNAL_SERVER_ERROR({ message: "Failed to count attendance policies" });
    }
    if (policiesCount === 1) {
      throw errors.FORBIDDEN({ message: "Cannot delte the last attendance policy." });
    }

    await db
      .delete(attendancePolicy)
      .where(
        and(
          eq(attendancePolicy.id, input.id),
          eq(attendancePolicy.organizationId, context.organization.id),
        ),
      );
  });
