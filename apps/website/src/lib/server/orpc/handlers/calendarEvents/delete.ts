import { calendarEvent, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const deleteCalendarEventHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input, errors }) => {
    const event = await db.query.calendarEvent.findFirst({
      where: { id: input.id, calendar: { organizationId: context.organization.id } },
      with: { calendar: true },
    });

    if (!event) {
      throw errors.NOT_FOUND();
    }

    await db.delete(calendarEvent).where(eq(calendarEvent.id, input.id));
  });
