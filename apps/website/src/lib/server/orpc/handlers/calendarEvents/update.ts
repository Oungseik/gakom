import { calendarEvent, eq } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
  data: z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    date: z.coerce.date(),
    calendarId: z.string(),
  }),
});

export const updateCalendarEventHandler = os
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

    await db
      .update(calendarEvent)
      .set({
        title: input.data.title,
        description: input.data.description ?? null,
        date: input.data.date,
        calendarId: input.data.calendarId,
      })
      .where(eq(calendarEvent.id, input.id));
  });
