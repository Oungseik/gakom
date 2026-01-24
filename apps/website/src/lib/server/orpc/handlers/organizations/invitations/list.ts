import { and, desc, eq, ilike, invitation, like, organization } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  cursor: z.number().optional(),
  pageSize: z.number(),
  slug: z.string(),
  filter: z
    .object({
      role: z.string().optional(),
      status: z.enum(["pending", "accepted", "rejected", "canceled"]).optional(),
      search: z.string().optional(),
    })
    .optional(),
});

export const listInvitationsHandler = os
  .route({ method: "GET" })
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input }) => {
    const search = input.filter?.search;
    const condition = and(
      eq(organization.slug, input.slug),
      search ? ilike(invitation.email, `%${search}%`) : undefined,
      input.filter?.role ? like(invitation.role, input.filter.role) : undefined,
      input.filter?.status ? like(invitation.status, input.filter.status) : undefined,
    );

    const items = await db
      .select({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        position: invitation.position,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        organizationId: organization.id,
        attendancePolicyId: invitation.attendancePolicyId,
      })
      .from(invitation)
      .innerJoin(organization, eq(invitation.organizationId, organization.id))
      .where(condition)
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
