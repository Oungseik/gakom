import { and, asc, calendar, calendarEvent, eq, gte, lte } from "@repo/db";
import { z } from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  cursor: z.number().optional(),
  pageSize: z.number().optional().default(10),
  filter: z
    .object({
      from: z.coerce.date().optional(),
      to: z.coerce.date().optional(),
      calendarId: z.string().optional(),
    })
    .optional(),
});

export const listCalendarEventsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ context, input }) => {
    const limit = input.pageSize + 1;
    const filter = input.filter;

    // Members can only see events from their assigned calendar
    if (context.member.role === "MEMBER" && !context.member.calendarId) {
      return {
        items: [],
        nextCursor: undefined,
        pageSize: input.pageSize,
      };
    }

    const items = await db
      .select({
        id: calendarEvent.id,
        calendarId: calendarEvent.calendarId,
        title: calendarEvent.title,
        description: calendarEvent.description,
        date: calendarEvent.date,
        createdAt: calendarEvent.createdAt,
        updatedAt: calendarEvent.updatedAt,
      })
      .from(calendarEvent)
      .where(
        and(
          context.member.role === "MEMBER"
            ? eq(calendarEvent.calendarId, context.member.calendarId!)
            : eq(calendar.organizationId, context.organization.id),
          filter?.calendarId ? eq(calendarEvent.calendarId, filter.calendarId) : undefined,
          filter?.from ? gte(calendarEvent.date, filter.from) : undefined,
          filter?.to ? lte(calendarEvent.date, filter.to) : undefined,
        ),
      )
      .innerJoin(calendar, eq(calendarEvent.calendarId, calendar.id))
      .orderBy(asc(calendarEvent.date))
      .offset(input.cursor ?? 0)
      .limit(limit);

    let nextCursor: number | undefined;
    if (items.length > input.pageSize) {
      items.pop();
      nextCursor = (input.cursor ?? 0) + input.pageSize;
    }

    return {
      items,
      nextCursor,
      pageSize: input.pageSize,
    };
  });
