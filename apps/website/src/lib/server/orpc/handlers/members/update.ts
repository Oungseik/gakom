import { ORPCError } from "@orpc/server";
import { eq, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  memberId: z.string(),
  data: z.object({
    position: z.string(),
    role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
  }),
});

export const updateMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["OWNER", "ADMIN"]))
  .handler(async ({ input, context }) => {
    const result = await db.query.member.findFirst({
      where: { id: input.memberId, organization: { slug: context.organization.slug } },
      columns: {},
    });

    if (!result) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found" });
    }

    await db
      .update(member)
      .set({
        role: input.data.role,
        position: input.data.position,
      })
      .where(eq(member.userId, input.memberId));
  });
