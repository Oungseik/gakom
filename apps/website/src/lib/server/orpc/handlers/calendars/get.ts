import { and, calendar, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const getCalendarHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input, errors }) => {
    const [item] = await db
      .select({
        id: calendar.id,
        name: calendar.name,
        isDefault: calendar.isDefault,
        organizationId: calendar.organizationId,
        createdAt: calendar.createdAt,
        updatedAt: calendar.updatedAt,
      })
      .from(calendar)
      .where(and(eq(calendar.id, input.id), eq(calendar.organizationId, context.organization.id)));

    if (!item) {
      throw errors.NOT_FOUND();
    }

    // Members can only get their assigned calendar
    if (context.member.role === "MEMBER" && context.member.calendarId !== item.id) {
      throw errors.FORBIDDEN({
        message: "You can only view your assigned calendar",
      });
    }

    return { item };
  });
