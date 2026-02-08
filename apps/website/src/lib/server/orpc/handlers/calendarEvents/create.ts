import { and, calendar, calendarEvent, eq, inArray } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const eventInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.coerce.date(),
  calendarId: z.string(),
});

const input = z.object({
  slug: z.string(),
  data: z.array(eventInput).min(1),
});

export const createCalendarEventsHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ context, input, errors }) => {
    const calendarIds = [...new Set(input.data.map((e) => e.calendarId))];

    // Verify all calendars belong to the organization
    const calendars = await db
      .select({ id: calendar.id })
      .from(calendar)
      .where(
        and(
          eq(calendar.organizationId, context.organization.id),
          inArray(calendar.id, calendarIds),
        ),
      );

    if (calendars.length !== calendarIds.length) {
      throw errors.FORBIDDEN({
        message: "One or more calendars do not belong to this organization",
      });
    }

    const now = new Date();
    const eventsToInsert = input.data.map((e) => ({
      calendarId: e.calendarId,
      title: e.title,
      description: e.description ?? null,
      date: e.date,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(calendarEvent).values(eventsToInsert);

    return { success: true };
  });
