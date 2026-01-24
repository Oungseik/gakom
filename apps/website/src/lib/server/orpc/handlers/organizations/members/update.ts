import { and, eq, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  userId: z.string(),
  data: z.object({
    position: z.string().nullable(),
    role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
    attendancePolicyId: z.string().nullable(),
  }),
});

export const updateMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ input, context }) => {
    await db
      .update(member)
      .set({
        role: input.data.role,
        position: input.data.position,
        attendancePolicyId: input.data.attendancePolicyId,
      })
      .where(
        and(eq(member.userId, input.userId), eq(member.organizationId, context.organization.id)),
      );
  });
