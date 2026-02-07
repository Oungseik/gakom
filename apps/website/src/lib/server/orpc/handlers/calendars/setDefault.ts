import { and, calendar, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const setDefaultCalendarHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    await db.transaction(async (tx) => {
      await tx
        .update(calendar)
        .set({ isDefault: false })
        .where(eq(calendar.organizationId, context.organization.id));

      await tx
        .update(calendar)
        .set({ isDefault: true })
        .where(
          and(eq(calendar.id, input.id), eq(calendar.organizationId, context.organization.id)),
        );
    });
  });
