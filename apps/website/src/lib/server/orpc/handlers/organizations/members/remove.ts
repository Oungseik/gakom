import { and, eq, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  userId: z.string(),
});

export const removeMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ input, context }) => {
    await db
      .update(member)
      .set({
        status: "DEACTIVATED",
      })
      .where(
        and(eq(member.userId, input.userId), eq(member.organizationId, context.organization.id)),
      );
  });
