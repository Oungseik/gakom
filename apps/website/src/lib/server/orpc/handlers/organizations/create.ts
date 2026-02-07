import { ORPCError } from "@orpc/server";
import { member, organization } from "@repo/db";
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
      throw new ORPCError("BAD_REQUEST", { message: `The slug "${input.slug}" is already taken.` });
    }

    const org = await db
      .insert(organization)
      .values({
        name: input.name,
        slug: input.slug,
        logo: input.logo,
      })
      .returning({ id: organization.id });

    const orgId = org.at(0)?.id;
    if (!orgId) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Something went wrong while create organization",
      });
    }

    // Add the creator as an OWNER member
    await db.insert(member).values({
      organizationId: orgId,
      userId: context.session.user.id,
      role: "OWNER",
    });

    return {
      id: orgId,
      name: input.name,
      slug: input.slug,
      logo: input.logo,
    };
  });
