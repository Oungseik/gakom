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
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ context, input, errors }) => {
    const m = await db
      .select({ count: count() })
      .from(member)
      .where(
        and(
          eq(member.attendancePolicyId, input.id),
          eq(member.organizationId, context.organization.id),
        ),
      );

    if (m.at(0)?.count) {
      return errors.FORBIDDEN({
        message: "Members are assigned to this attendance policy",
      });
    }

    const ap = await db
      .select({ count: count() })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.organizationId, context.organization.id));

    const policiesCount = ap.at(0)?.count;
    if (!policiesCount) {
      return errors.INTERNAL_SERVER_ERROR({ message: "Failed to count attendance policies" });
    }
    if (policiesCount === 1) {
      return errors.FORBIDDEN({ message: "Not allow to delete last attendance policy" });
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
