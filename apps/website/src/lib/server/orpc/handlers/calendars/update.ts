import { and, calendar, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
  data: z.object({
    name: z.string().min(1).max(100),
    isDefault: z.boolean(),
  }),
});

export const updateCalendarHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    await db.transaction(async (tx) => {
      if (input.data.isDefault) {
        await tx
          .update(calendar)
          .set({ isDefault: false })
          .where(eq(calendar.organizationId, context.organization.id));
      }

      await tx
        .update(calendar)
        .set(input.data)
        .where(
          and(eq(calendar.id, input.id), eq(calendar.organizationId, context.organization.id)),
        );
    });
  });
