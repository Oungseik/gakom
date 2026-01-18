import { attendancePolicy, count, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
});

export const countAttendancePoliciesHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context }) => {
    const result = await db
      .select({ count: count() })
      .from(attendancePolicy)
      .where(eq(attendancePolicy.organizationId, context.organization.id));

    return { count: result.at(0)?.count ?? 0 };
  });
