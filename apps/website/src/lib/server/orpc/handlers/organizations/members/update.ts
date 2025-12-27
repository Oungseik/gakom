import { eq, member } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  userId: z.string(),
  data: z.object({ position: z.string(), role: z.enum(["admin", "member"]) }),
});

export const updateMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["owner", "admin"]))
  .handler(async ({ input }) => {
    db.update(member)
      .set({ role: input.data.role, position: input.data.position })
      .where(eq(member.userId, input.userId));
  });
