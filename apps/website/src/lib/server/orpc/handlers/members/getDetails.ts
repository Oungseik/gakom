import { ORPCError } from "@orpc/server";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  id: z.string(),
  slug: z.string(),
});

export const getMemberDetailsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware())
  .handler(async ({ input, context }) => {
    if (input.id !== context.session.user.id && context.member.role === "MEMBER") {
      throw new ORPCError("FORBIDDEN", { message: "Cannot access other person information" });
    }

    const member = await db.query.member.findFirst({
      where: { id: input.id },
      with: { user: true },
    });
    if (!member) {
      throw new ORPCError("NOT_FOUND", { message: "Member not found" });
    }

    return member;
  });
