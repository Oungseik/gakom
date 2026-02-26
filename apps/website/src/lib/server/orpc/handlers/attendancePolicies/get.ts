import { and, attendancePolicy, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const getAttendancePolicyHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input, errors }) => {
    const item = await db.query.attendancePolicy.findFirst({
      where: { id: input.id, organizationId: context.organization.id },
    });

    if (!item) {
      throw errors.NOT_FOUND();
    }

    return { item };
  });
