import { ORPCError } from "@orpc/server";
import { leave } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  data: z.object({
    name: z.string().min(1).max(100),
    days: z.number().positive(),
  }),
});

export const createLeavePolicyHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    const existingLeave = await db.query.leave.findFirst({
      where: {
        name: input.data.name,
        organizationId: context.organization.id,
      },
    });

    if (existingLeave) {
      throw new ORPCError("CONFLICT", { message: "A leave policy with this name already exists" });
    }

    await db.insert(leave).values({
      ...input.data,
      organizationId: context.organization.id,
    });
  });
