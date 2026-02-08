import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  id: z.string(),
});

export const getCalendarEventHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input, errors }) => {
    const event = await db.query.calendarEvent.findFirst({
      where: { id: input.id, calendar: { organizationId: context.organization.id } },
      with: { calendar: true },
    });

    if (!event) {
      throw errors.NOT_FOUND();
    }

    // Members can only view events from their assigned calendar
    if (
      context.member.role === "MEMBER" &&
      (!context.member.calendarId || context.member.calendarId !== event.calendarId)
    ) {
      throw errors.FORBIDDEN({
        message: "You can only view events from your assigned calendar",
      });
    }

    return {
      event: {
        id: event.id,
        calendarId: event.calendarId,
        title: event.title,
        description: event.description,
        date: event.date,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
      },
    };
  });
