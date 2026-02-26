import { and, attendancePolicy, count, eq, member } from "@repo/db";
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
      throw errors.FORBIDDEN({ message: "Cannot delete the last attendance policy." });
    }

    const assignments = await db
      .select({ count: count() })
      .from(member)
      .where(eq(member.attendancePolicyId, input.id));

    if (assignments.at(0)?.count) {
      throw errors.FORBIDDEN({ message: "Cannot delete attendance policy assigned to the member" });
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
