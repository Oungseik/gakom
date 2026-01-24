import { ORPCError } from "@orpc/server";
import z from "zod";
import { db } from "$lib/server/db";
import { authMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  name: z.string(),
  slug: z.string().min(3),
  logo: z.string(),
});

export const createOrganizationHandler = os
  .input(input)
  .use(authMiddleware)
  .handler(async ({ input, context }) => {
    const existingOrg = await db.query.organization.findFirst({
      where: { slug: input.slug },
      columns: { id: true },
    });

    if (existingOrg) {
      throw new ORPCError("BAD_REQUEST", { message: `The slug "${input.slug} is already taken."` });
    }
  });
