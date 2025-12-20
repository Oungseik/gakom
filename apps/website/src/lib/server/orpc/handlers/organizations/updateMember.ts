import z from "zod";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  slug: z.string(),
  userId: z.string(),
  data: { position: z.string() },
});

export const updateMemberHandler = os
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ context }) => {
    const { role } = context.organization;
  });
