import { ORPCError } from "@orpc/client";
import { and, eq, leave } from "@repo/db";
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
    const existingLeave = await db.query.leave.findFirst({
      where: {
        name: input.data.name,
        organizationId: context.organization.id,
      },
    });

    if (existingLeave && existingLeave.id !== input.id) {
      throw new ORPCError("CONFLICT", { message: "A leave policy with this name already exists" });
    }

    await db
      .update(leave)
      .set({
        ...input.data,
      })
      .where(and(eq(leave.id, input.id), eq(leave.organizationId, context.organization.id)));
  });
