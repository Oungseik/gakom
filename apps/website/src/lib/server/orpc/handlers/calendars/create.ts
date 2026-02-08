import { calendar, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  data: z.object({
    name: z.string().min(1).max(100),
    isDefault: z.boolean().optional(),
  }),
});

export const createCalendarHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input }) => {
    const id = crypto.randomUUID();

    await db.transaction(async (tx) => {
      if (input.data.isDefault) {
        await tx
          .update(calendar)
          .set({ isDefault: false })
          .where(eq(calendar.organizationId, context.organization.id));
      }

      await tx.insert(calendar).values({
        id,
        name: input.data.name,
        organizationId: context.organization.id,
        isDefault: input.data.isDefault ?? false,
      });
    });

    return { id };
  });
