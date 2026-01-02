import { leave } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  leave: z.object({
    name: z.string().min(1),
    days: z.number().int().positive(),
  }),
});

export const createLeaveHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ context, input }) => {
    await db.insert(leave).values({
      name: input.leave.name,
      organizationId: context.organization.id,
      days: input.leave.days,
    });
  });
