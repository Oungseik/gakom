import { ORPCError } from "@orpc/server";
import { and, count, eq, isNull, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  memberId: z.string(),
});

export const removeMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ input, context }) => {
    const m = await db.query.member.findFirst({ where: { id: input.memberId } });

    if (m?.role === "OWNER") {
      const result = await db
        .select({ count: count() })
        .from(member)
        .where(and(eq(member.role, "OWNER"), isNull(member.leftAt)));

      if (!result.at(0)?.count) {
        throw new ORPCError("BAD_REQUEST", { message: "Cannot remove last owner" });
      }
    }

    await db
      .update(member)
      .set({
        leftAt: new Date(),
      })
      .where(
        and(eq(member.id, input.memberId), eq(member.organizationId, context.organization.id)),
      );
  });
