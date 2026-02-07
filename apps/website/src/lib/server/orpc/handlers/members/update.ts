import { and, eq, inArray, leaveToMember, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  memberId: z.string(),
  data: z.object({
    position: z.string().nullable(),
    role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
    attendancePolicyId: z.string().nullable(),
    leaveIds: z.array(z.string()),
  }),
});

export const updateMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ input }) => {
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
        })
        .where(eq(member.userId, input.memberId));
    });
  });
