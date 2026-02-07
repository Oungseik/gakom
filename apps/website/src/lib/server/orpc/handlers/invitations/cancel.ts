import { and, eq, invitation } from "@repo/db";
import z from "zod";
import { db } from "$lib/server/db";
import { organizationMiddleware, os } from "$lib/server/orpc/base";

const input = z.object({
  invitationId: z.string(),
  slug: z.string(),
});

export const cancelInvitationHandler = os
  .input(input)
  .use(organizationMiddleware(["ADMIN", "OWNER"]))
  .handler(async ({ input, context }) => {
    await db
      .update(invitation)
      .set({ status: "CANCELED" })
      .where(
        and(
          eq(invitation.id, input.invitationId),
          eq(invitation.organizationId, context.organization.id),
        ),
      );
  });
