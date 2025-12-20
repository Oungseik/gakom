import { desc, eq, invitation, organization } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.number().optional(),
  pageSize: z.number(),
  slug: z.string(),
});

export const listInvitationsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["admin", "owner"]))
  .handler(async ({ input }) => {
    const items = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        organizationId: organization.id,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .where(eq(organization.slug, input.slug))
      .orderBy(desc(invitation.createdAt))
      .offset(input.cursor ?? 0)
      .limit(input.pageSize + 1);

    let nextCursor: typeof input.cursor;
    if (items.length > input.pageSize) {
      items.pop();
      nextCursor = (input.cursor ?? 0) + input.pageSize;
    }

    return {
      items,
      nextCursor,
      pageSize: input.pageSize,
    };
  });
