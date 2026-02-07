import { and, calendar, eq, inArray, leaveToMember, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { ORPCError, organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  memberId: z.string(),
  data: z.object({
    position: z.string().nullable(),
    role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
    attendancePolicyId: z.string().nullable(),
    calendarId: z.string().nullable(),
    leaveIds: z.array(z.string()),
  }),
});

export const updateMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ context, input }) => {
    if (input.data.calendarId) {
      const cal = await db.query.calendar.findFirst({
        where: and(
          eq(calendar.id, input.data.calendarId),
          eq(calendar.organizationId, context.organization.id),
        ),
      });
      if (!cal) {
        throw new ORPCError("NOT_FOUND", {
          message: "Calendar not found or does not belong to this organization",
        });
      }
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(leaveToMember)
        .where(
          and(
            inArray(leaveToMember.leaveId, input.data.leaveIds),
            eq(leaveToMember.memberId, input.memberId),
          ),
        );

      await tx
        .insert(leaveToMember)
        .values(input.data.leaveIds.map((id) => ({ leaveId: id, memberId: input.memberId })));

      await tx
        .update(member)
        .set({
          role: input.data.role,
          position: input.data.position,
          attendancePolicyId: input.data.attendancePolicyId,
          calendarId: input.data.calendarId,
        })
        .where(eq(member.userId, input.memberId));
    });
  });
