import { and, eq, leavePolicy } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  id: z.string(),
  slug: z.string(),
  data: z.object({
    name: z.string().min(1).max(100),
    days: z.number().positive(),
  }),
});

export const updateLeavePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    await db
      .update(leavePolicy)
      .set({
        ...input.data,
      })
      .where(and(eq(leavePolicy.id, input.id), eq(leavePolicy.organizationId, context.organization.id)));
  });
